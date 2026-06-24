export default {
    [roll_dice]: {
        jukebox,
        init() {
            super.init();
            this.jukebox = this.searchModule('jukebox');
        },

        
        rollAndDisplay(diceGroups, modifier) {
            this.jukebox.playRollSound();
            super.rollAndDisplay(diceGroups, modifier);            
        }
    }
    [jukebox]: {
        playRollSound() {
            if (this.queue && !this.queue.isPlaying) {
                // TODO: select roll sound
                // TODO: load the sound
                // TODO: play the sound
            }
        }
    }
}
