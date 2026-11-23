#!/bin/zsh
# Start one swarm agent fully detached (own session, survives the lead's shell or app exiting).
# usage: launch.sh <role> <provider> <model> <brief.md> [thinking] [cap_min]
R=${0:A:h:h:h}; mkdir -p $R/.swarm
nohup perl -MPOSIX -e 'POSIX::setsid(); exec @ARGV' $R/tools/swarm/run.sh "$@" > $R/.swarm/$1.out 2>&1 < /dev/null &
echo "launched $1 (pid $!)"
