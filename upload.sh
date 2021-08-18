#!/bin/bash

if [ -z "$1" ]
  then
    echo "No host provided."
    exit 1
  else
    HOST=$1
fi

if [ -z "$2" ]
then
  echo "No project provided."
  exit 1
else
  PROJECT=$2
fi

ZIPPED_FILE=$PROJECT.tar.gz


echo "Zipping the project: $ZIPPED_FILE"
tar -czvf $ZIPPED_FILE $PROJECT

echo "Uploading to host: $HOST"
scp $ZIPPED_FILE ubuntu@$HOST:.

echo "Removing old upload."
ssh ubuntu@$HOST "rm -rf $PROJECT"

echo "Extracting new build."
ssh ubuntu@$HOST "tar -xzvf $ZIPPED_FILE"

echo
echo "Successfully uploaded new build."