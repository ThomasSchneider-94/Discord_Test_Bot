# Roll Dice

Module for rolling dice and managing dice-related actions.

## Commands

- **/roll**
  Roll a set of dice.
  - `dice`: Value of the dice to roll: 6, 10, 20... Default value can be configured with `/set-dice`.
  - `count`: Number of dice to roll. Default is 1.
  - `modifier`: Modifier, positive or negative, to apply to the roll's total.
  - `color`: Color of the dice. Use the preset colors or hexadecimal color. Default value can be configured with `/set-dice`

- **/froll**
  Roll multiples sets of dice in one argument.
  - `args`: Use the [Die count]d[Die value] format, and separe each group by blanck space. Add modifier with +/-. Default dice value and color can be configured with `/set-dice`

- **/set-dice**
  Configure a player's default dice value or/and default color.
  - `color`: Default color of the dice when not specified. Use the preset colors or hexadecimal color.
  - `value`: Default value of the dice to roll when not specified.

- **/roll-display**
  Configure the results display after a dice roll.
  - `list`: Display the list of all dice result.
  - `value`: Return the roll's successes.
  - `visual`: Display an image with all dice results.
