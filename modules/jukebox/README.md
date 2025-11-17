# Jukebox

The **Jukebox** module allows you to play music from YouTube in a voice channel.

## Functions

- **/jb-connect** `channel`  
  Connects the bot to a voice channel. If no channel is selected, it connects to your current voice channel.

- **/jb-add** `url`  
  Adds a YouTube music link to the queue.

- **/jb** `action`  
  - `Play` : Resume the music  
  - `Pause` : Pause the music  
  - `Stop` : Stop playing and clear the queue  
  - `Skip` : Skip to the next track  
  - `Now Playing` : Display the currently playing music  
  - `List` : Display the music queue

## Events

The bot will automatically disconnect after **10 seconds** of being alone in a voice channel.
