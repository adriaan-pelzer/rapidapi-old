#!/bin/sh

PROCESS_NUM=`pgrep node`

if [ -z $PROCESS_NUM ];
then
    sudo start rapidapi
fi
