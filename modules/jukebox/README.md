# Jukebox

Jukebox module to play music from Youtube in voice channels.

## Commands

- **/jb**
  Perform a specific action (play, pause, skip...).
  - `action`: Action to perform: Play, Pause, Skip, Play again, loop, display current music or waiting list.

- **/jb-add**
  Add a music to the waiting list. If the bot is not connected to a voice chanel, it connects to the one you are currently in.
  - `url`: Youtube url of the music to play.

- **/jb-connect**
  Connect the bot to a voice channel or the voice channel you are currently in.
  - `channel`: Voice channel to cennect to.

## Features

The bot disconnect after 10s of being left alone in a voice channel.
