# What Goes In Must Come Out
My Ludum Dare 47 Entry, the theme was **Stuck In A Loop**

*This is a post competition version*

## Play The Game
- [Compo Version](https://simplepotential.com/projects/LD47/game.htm)
- [Production Version](https://simplepotential.com/projects/What-Goes-In-Must-Come-Out/game.htm)

### Purpose and Description
My entry for LD47, titled "What Goes in Must Come Out", was some of the most fun I've had building a game for Ludum Dare. LD snuck up on me and I hadn't really set aside any time for it. Unity3D was going to require a large update and I didn't really have time to waste. So I decided to try something new and stick to strictly a browser based game written entirely in JavaScript (JS).

Most of my daily real life is spent in JS however I've never really applied business application development to game design and wasn't sure how this was going to work out. I had some experience with charts using the Canvas object and thought it might be a good place to start. This turned out to be a decent decision.

I then needed to decide on a game, and I really wanted to keep it simple. I was thinking old school "Snake" was a way to go. Low graphic requirements, simple mechanics, easy to understand. I also knew I didn't want to build a clone of Snake. So I landed on something similar but still really different. With the theme "Stuck in a Loop", for some reason the food chain came to mind. What you eat, eventually comes back out. Maybe not the most professional idea, but I was on a time budget and had to stick with something fast.

As the player (white square), your goal is to eat as much food (green square) as you can and stay alive. Moving uses energy, reducing your Belly's fullness, which you replenish by eating. Occasionally some of this food will become poo (brown square). The more full you are, the more poo you generate. Eating poo is bad for you, as you might imagine. Bonuses appear occasionally that provide more energy/fullness or clear poo from the screen.

See more on [Ludum Dare](https://ldjam.com/events/ludum-dare/47/what-goes-in-must-come-out)

### Post Submission
For the most part, my play testers had not discovered any bugs before I submitted the game but I only had about 15 hours of dev time, not much time to debug. After submitting the game, I got complaints about the game lagging after playing for long periods of time. Some of this had to do with the sound of the player moving, I solved this by looping the sound once the player starts initial movement. Movement can't stop once you move so looping works. Still players complained. After some research, I think I have it figured out but have not yet tested the fix for the issue. Apparently the Canvas doesn't like to be 100% written to over and over again. So for instance, I color the entire background in black. It does this every frame. All food, power ups, poo, etc.. all drawn over and over again. This should be easy to fix by layering canvases on top of each other with transparent backgrounds and only redraw the layers when needed. These are things on my list to do.

These items were added after the submission period based on feedback and additional play testing 
- Better key press listening
- You have a chance to poo anytime belly is >= 50%
- Removed Play Speed Increase as Score gets Higher
- Food is Removed from Game if it gets Poo on It
- Mouse Hidden During Play
- F2 will Restart the Game
- Set a Max Food Spawn Limit of 30
- Corrected spelling errors and add more comments to code.
- Added a very slight flashing background when starving
- Added borders that shrink and expand based on belly fullness

### Future Plans
As time allows, I'd like to make some additional changes including

- Immune to Poo bonus
- Possibly remove the *Belly %* fullness in score area, center the score, and enlarge score's text
- Redo the way text is rendered on title
    - Function base that prints, positions, formats the text
    - Auto position option based on last text rendered
- Leaderboard
- Do more for lag
    - Possibly use transparent layered canvases
    - Render different elements on different layers since much of game is static

