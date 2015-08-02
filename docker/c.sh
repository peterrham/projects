docker run -i -t -v ~/workspace/:/home/eclipse/workspace/ \
-e "DISPLAY=172.17.42.1:0" -v /tmp/.X11-unix:/tmp/.X11-unix:ro \
-xs-entrypoint=/bin/bash \
eclipse/eclipse

# --entry-point="/bin/bash" \
