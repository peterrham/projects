# docker run -it \
--net host \
--cpuset 0 \
--memory 512mb \
-v /tmp/.X11-unix:/tmp/.X11-unix \
-e DISPLAY=unix$DISPLAY \
-v $HOME/Downloads:/root/Downloads \
-v $HOME/.config/google-chrome/:/data \
-v /dev/snd:/dev/snd --privileged \
--name chrome \
jess/chrome


# docker run -it \
--net host \
--cpuset 0 \
--memory 512mb \
-v /tmp/.X11-unix:/tmp/.X11-unix \
-e DISPLAY=unix$DISPLAY \
-v $HOME/Downloads:/root/Downloads \
-v $HOME/.config/google-chrome/:/data \
-v /dev/snd:/dev/snd --privileged \
jess/chrome

docker run -v ~/workspace/:/home/eclipse/workspace/ \
-e DISPLAY=172.17.42.1:0 -v /tmp/.X11-unix:/tmp/.X11-unix:ro \
-d leesah/eclipse


