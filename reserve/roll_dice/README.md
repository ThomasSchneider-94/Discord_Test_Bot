# Roll dice

The `roll_dice` module allows you to roll dice in Discord.

## Functions

- **/clear-data**  
  Deletes all sets of colored dice that are not used by any player.

- **/configure_results**  
  Select which information is displayed after a roll. Multiple settings can be enabled at the same time.  
  - `list-results` : Returns the results as a list  
  - `total-value` : Returns the sum of all dice and any bonus  
  - `above-average` : Returns the number of dice above the average  
  - `visual-results` : Returns an image showing the results  

- **/roll**  
  Roll a set of dice.  
  - `dice` : Value of the dice to roll (e.g., d10, d20). The default value can be configured  
  - `dice-count` : Number of dice to roll  
  - `bonus` : Bonus added to the total sum  
  - `special-dice` : Number of special dice (dice of a different color). The default value can be configured  

- **/froll**  
  Same as **/roll**, but with a single argument.  
  - `args` : Arguments for **/roll** using the format:  
    `[Dice count]d[Dice value]+[Bonus] [Special dice count]`  
    Example: `3d10+5 1` will roll three d10, including one special die, and add 5 to the total. Default values can be configured.

- **/set-default-dice**  
  Set the color and/or default value of your dice.  
  - `color` : Color of the dice. Accepts hex color codes (e.g. `#4f3d78`). Default is white  
  - `value` : Default value of your dice  

- **/set-special-dice**  
  Set the color and/or count of your special dice.  
  - `color` : Color of the dice. Accepts hex color codes (e.g. `#4f3d78`). Default is white  
  - `count` : Default number of special dice
