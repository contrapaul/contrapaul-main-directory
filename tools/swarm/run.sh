#!/bin/zsh
# Run one pi agent of the swarm.
# usage: run.sh <role> <provider> <model> <brief.md> [thinking=high] [cap_min=180] [where=worktree|main]
#   worktree: ../starfighters-<role> on branch swarm/<role> (made from main if missing)
#   main:     this checkout (for planners that only write their own doc, no commits)
# Logs: .swarm/logs/<role>.log  Sessions: .swarm/sessions/<role>/  Status: .swarm/status/<role>
role=$1; prov=$2; model=$3; brief=${4:A}; think=${5:-high}; cap=${6:-180}; where=${7:-worktree}
R=${0:A:h:h:h}; mkdir -p $R/.swarm/{logs,sessions/$role,status}
log=$R/.swarm/logs/$role.log; sd=$R/.swarm/sessions/$role; st=$R/.swarm/status/$role
if [ $where = main ]; then wt=$R; else
  wt=${R:h}/contrapaul-galaxy-$role
  [ -d $wt ] || git -C $R worktree add -q -b swarm/$role $wt galaxy-demo || exit 1
  [ -d $R/node_modules ] && [ ! -e $wt/node_modules ] && ln -s $R/node_modules $wt/node_modules
fi
echo "start $(date +%s) $prov/$model $where" > $st
start=$(date +%s)
for try in 1 2 3; do
  ( cd $wt && exec pi --provider $prov --model $model --thinking $think --session-dir $sd -p "$(cat $brief)" ) < /dev/null >> $log 2>&1 &   # stdin MUST be closed: pi -p reads piped stdin
  pid=$!; ok=0
  for i in $(seq 180); do   # no reply within 900 s: restart (a big first read can take minutes)
    sleep 5
    grep -qs '"usage"' $sd/*.jsonl(N) /dev/null && { ok=1; break; }
    kill -0 $pid 2>/dev/null || { ok=1; break; }
  done
  [ $ok = 1 ] && break
  echo "[swarm] no reply in 900 s on try $try, restarting" >> $log; kill $pid 2>/dev/null; wait $pid 2>/dev/null
done
while kill -0 $pid 2>/dev/null; do
  if [ $(( $(date +%s) - start )) -ge $(( cap * 60 )) ]; then
    echo "[swarm] cap of $cap min reached, stopping" >> $log; kill $pid; sleep 5; kill -9 $pid 2>/dev/null; break; fi
  sleep 20
done
wait $pid 2>/dev/null; rc=$?
echo "end $(date +%s) rc=$rc minutes=$(( ($(date +%s) - start) / 60 ))" >> $st
echo "$role done in $(( ($(date +%s) - start) / 60 )) min (rc=$rc)"; tail -c 1200 $log
