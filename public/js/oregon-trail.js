class OregonTrail {
    constructor(outputCallback) {
        this.outputCallback = outputCallback;
        this.gameState = {
            day: 1,
            distance: 0,
            health: 100,
            food: 100,
            maxFood: 100,
            lastForageDay: 0, // Track the last day foraged
            lastRestDay: 0, // Track the last day rested
            lastStatusUpdate: 0, // Track when we last showed status
            pace: 'steady', // steady, fast, grueling
            weather: 'good', // good, poor, severe
            inventory: [],
            recentEvents: [], // Track recent events
            events: [
                { text: 'You found wild berries! (+10 food)', effect: () => this.addFood(10) },
                { text: 'A wheel broke! (-1 day for repairs)', effect: () => this.gameState.day += 1 },
                { text: 'Heavy rain slowed your progress (-5 food)', effect: () => this.addFood(-5) },
                { text: 'You shot a buffalo! (+20 food)', effect: () => this.addFood(20) },
                { text: 'River crossing went poorly, supplies damaged (-10 food)', effect: () => this.addFood(-10) },
                { text: 'Met friendly natives, traded for supplies (+15 food)', effect: () => this.addFood(15) },
                { text: 'Someone has dysentery... (-15 health)', effect: () => this.gameState.health -= 15 },
                { text: 'Found an abandoned wagon with supplies! (+25 food)', effect: () => this.addFood(25) },
                { text: 'Rocky terrain ahead, progress is slow (-1 day)', effect: () => this.gameState.day += 1 },
                { text: 'Clear skies and smooth trails! (+10 miles)', effect: () => this.gameState.distance += 10 },
                { 
                    text: 'Found a hunting rifle in an abandoned camp!',
                    effect: () => {
                        if (!this.gameState.inventory.includes('rifle')) {
                            this.gameState.inventory.push('rifle');
                            return true;
                        }
                        return false;
                    }
                },
                { 
                    text: 'Discovered quality cooking equipment!',
                    effect: () => {
                        if (!this.gameState.inventory.includes('cooking')) {
                            this.gameState.inventory.push('cooking');
                            return true;
                        }
                        return false;
                    }
                },
                {
                    text: 'Found a strong horse grazing nearby!',
                    effect: () => {
                        if (!this.gameState.inventory.includes('horse')) {
                            this.gameState.inventory.push('horse');
                            this.gameState.maxFood = 200;
                            return 'The extra horse allows you to carry more food (200 lbs max)!';
                        }
                        return false;
                    }
                },
                {
                    text: 'Thieves raided your wagon in the night!',
                    effect: () => {
                        if (this.gameState.inventory.length > 0) {
                            const index = Math.floor(Math.random() * this.gameState.inventory.length);
                            const stolenItem = this.gameState.inventory.splice(index, 1)[0];
                            if (stolenItem === 'horse') {
                                this.gameState.maxFood = 100;
                                if (this.gameState.food > 100) {
                                    const lostFood = this.gameState.food - 100;
                                    this.gameState.food = 100;
                                    return `They stole your ${stolenItem}! You had to leave behind ${lostFood} lbs of food.`;
                                }
                                return `They stole your ${stolenItem}! Your food capacity is reduced.`;
                            }
                            return `They stole your ${stolenItem}!`;
                        }
                        return 'But found nothing worth taking.';
                    }
                }
            ]
        };
        this.isRunning = false;
        this.gameInterval = null;
    }

    // Helper method to add food respecting max capacity
    addFood(amount) {
        const oldFood = this.gameState.food;
        this.gameState.food = Math.max(0, Math.min(this.gameState.maxFood, this.gameState.food + amount));
        if (amount > 0 && this.gameState.food === this.gameState.maxFood && oldFood !== this.gameState.maxFood) {
            return `Food storage is full! (${this.gameState.maxFood} lbs max)`;
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.output(`
                          \`./////////:...            \`....-/////:\`
                          -oo:/oooooooooo++/\`:++++..+oooooooooooo/  
                           /+\`\`/ooooooooooo/.ooooo+.oooooooooooo+.  
                            o/  \`+ooooooooo/.ooooo+.oooooooooooo.   
                            .o-  -ooooooooo/.ooooo+.ooooooooooo:    
 --.  -+.                    :o-  +oooooooo/.ooooo+.oooooooooo:     
  .+oooo::+oo/::::::::       \`+-  +oooooooo/.ooooo+.oooooooooo\`     
\`/+oooooooooooooooooooo-     \`:...::..-:::..-::::::-:-..:::-.-\`     
 \`\`\`-::/ooooooooooooooo/------:+oo.\`:/./o:-/:/ooooo/\`./-.o+://\`     
      -:ooooooo++oooo+.      \`+o-  +---/o.\`.:. /o+  -/.\`\`o+----     
       \`oooo/.. \`:o+o+         \`\`  /:' :o-.:-\` ...  ./:--o/ \`:-     
      .++-\`/o\`  .:+:++              ./:/o//:\`        \`-/-oo+/.      

       _____                              _____         _ _          
      |  _  |                            |_   _|       (_) |         
      | | | |_ __ ___  __ _  ___  _ __     | |_ __ __ _ _| |         
      | | | | '__/ _ \\/ _\` |/ _ \\| '_ \\    | | '__/ _\` | | |         
      \\ \\_/ / | |  __/ (_| | (_) | | | |   | | | | (_| | | |         
       \\___/|_|  \\___|\\__, |\\___/|_| |_|   \\_/_|  \\__,_|_|_|         
                       __/ |                                                        
                      |___/       

You have embarked on the trail!
Type these commands to play:
- trail status    : Check your status
- trail inventory : Check your items
- trail items     : List all possible items
- trail events    : View recent events
- trail pace      : Change pace (steady/fast/grueling)
- trail hunt      : Try to hunt for food
- trail rest      : Rest for a day
- trail quit      : End the journey

Special Items:
- Hunting Rifle: Doubles food from successful hunts
- Cooking Equipment: Makes food last twice as long
- Extra Horse: Increases max food capacity to 200 lbs

Your journey begins...
`);
        this.gameInterval = setInterval(() => this.dailyUpdate(), 5000);
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.gameInterval);
        this.output('Journey ended. Type "trail" to start a new game.');
    }

    output(text) {
        this.outputCallback(text);
    }

    showStatus() {
        // Display status bar
        const healthBar = '♥'.repeat(Math.floor(this.gameState.health / 20)) + '·'.repeat(5 - Math.floor(this.gameState.health / 20));
        const foodBar = '⚫'.repeat(Math.floor(this.gameState.food / 20)) + '·'.repeat(5 - Math.floor(this.gameState.food / 20));
        const progress = Math.floor((this.gameState.distance / 2000) * 20);
        const distanceBar = '═'.repeat(progress) + '─'.repeat(20 - progress);

        this.output(`\n═══════════ Daily Status Update ════════════
Day ${this.gameState.day} [${distanceBar}] ${this.gameState.distance}/2000 miles
Health: [${healthBar}] Food: [${foodBar}] Pace: ${this.gameState.pace}
════════════════════════════════════════════`);
        
        this.gameState.lastStatusUpdate = this.gameState.day;
    }

    dailyUpdate() {
        if (!this.isRunning) return;

        // Skip travel if resting today
        const isRestDay = this.gameState.day === this.gameState.lastRestDay;

        // Update resources based on pace
        const paceEffects = {
            steady: { distance: 15, food: -5, health: -2 },
            fast: { distance: 25, food: -8, health: -5 },
            grueling: { distance: 35, food: -12, health: -10 }
        };

        const effect = paceEffects[this.gameState.pace];
        // Only add distance if not resting
        if (!isRestDay) {
            this.gameState.distance += effect.distance;
        }
        // Apply cooking equipment benefit if owned
        const foodConsumption = this.gameState.inventory.includes('cooking') ? 
            effect.food / 2 : effect.food;
        this.gameState.food += foodConsumption;
        // Only apply pace health effects if not resting
        if (!isRestDay) {
            this.gameState.health += effect.health;
        }

        // Apply starvation damage if no food
        if (this.gameState.food <= 0) {
            this.gameState.food = 0;
            const starvationDamage = 10; // 10% health damage per day
            this.gameState.health -= starvationDamage;
            this.output('\nYour party is starving! (-10% health)');
        }

        this.gameState.day += 1;

        // Ensure values stay within bounds
        this.gameState.health = Math.max(0, Math.min(100, this.gameState.health));
        this.gameState.food = Math.max(0, this.gameState.food);

        // Show daily status
        this.showStatus();

        // Random events
        if (Math.random() < 0.3) {
            const event = this.gameState.events[Math.floor(Math.random() * this.gameState.events.length)];
            const result = event.effect();
            const eventText = `Day ${this.gameState.day}: ${event.text}${result ? `\n${result}` : ''}`;
            this.gameState.recentEvents.unshift(eventText);
            // Keep only the 10 most recent events
            if (this.gameState.recentEvents.length > 10) {
                this.gameState.recentEvents.pop();
            }
            this.output(`\nEvent: ${event.text}${result ? `\n${result}` : ''}`);
        }

        // Check win/lose conditions
        if (this.gameState.distance >= 2000) {
            this.output('\nCONGRATULATIONS! You\'ve reached Oregon!');
            this.stop();
            return;
        }

        // Check if the party has died
        if (this.gameState.health <= 0) {
            // Check if the party has starved to death
            if (this.gameState.food <= 0) {
                // Check if the party has a horse to kill to survive
                if (this.gameState.inventory.includes('horse')) {
                    this.gameState.inventory.splice(this.gameState.inventory.indexOf('horse'), 1);
                    this.gameState.maxFood = 100;
                    this.gameState.food = 100;
                    this.gameState.health = 50;
                    this.output('\nYou have killed your horse to survive. You are no longer starving...');
                    return;
                }
                // Otherwise, they have died of starvation
                this.output('\nYour party has starved to death...');
                this.stop();
                return;
            }
            // Otherwise, they have died of other causes
            this.output('\nYour party has succumbed to the hardships of the trail...');
            this.stop();
            return;
        }
    }

    handleCommand(command) {
        if (!this.isRunning) return false;

        let result = false;

        switch (command.toLowerCase()) {
            case 'status':
                this.output(`
Day: ${this.gameState.day}
Distance: ${this.gameState.distance} miles
Health: ${this.gameState.health}%
Food: ${this.gameState.food}/${this.gameState.maxFood} lbs
Pace: ${this.gameState.pace}
`);
                result = true;
                break;

            case 'help':
                this.output(`
Available Commands:
=================
status    - Check your party's current condition and progress
           Shows: Day, Distance, Health, Food, and current Pace

inventory - View the items you currently have in your possession
           Special items can help you survive the journey

items     - List all possible items that can be found
           Learn about each item's effects and where to find them

events    - View the last 10 events that have occurred
           Keep track of what's happened on your journey

pace      - Change your travel pace (cycles between options)
           steady   - Balanced speed and resource consumption
           fast     - Cover more ground but use more resources
           grueling - Maximum speed but very hard on health

hunt      - Try to hunt for food (costs 10 food to attempt)
           Success: Gain 10-30 food (doubled with rifle)
           Failure: 50% chance of injury (0-20% health damage)

forage    - Search the area for edible plants (free)
           Can only be done once per day
           50% chance to find 1-10 food
           No risk of injury

rest      - Stop to rest for a day
           Can only be done once per day
           Party won't travel while resting
           Regain 20 health but consume 5 food

quit      - End your journey early
           Your progress will be lost

Tips:
- Keep your food above 20 lbs for hunting
- Rest when health drops below 50%
- Watch for special items that can help you survive
- The trail is 2000 miles long - pace yourself!
- Forage daily to supplement your food supply
- Resting stops travel but can save lives
`);
                result = true;
                break;

            case 'events':
                if (this.gameState.recentEvents.length === 0) {
                    this.output('No events have occurred yet.');
                } else {
                    this.output(`Recent Events:
${this.gameState.recentEvents.join('\n')}`);
                }
                result = true;
                break;

            case 'items':
                this.output(`Available Items:

Hunting Rifle
- Effect: Doubles the amount of food gained from successful hunts
- Found in: Abandoned camps

Cooking Equipment
- Effect: Reduces daily food consumption by half
- Found in: Abandoned settlements

Extra Horse
- Effect: Increases maximum food capacity from 100 to 200 lbs
- Found in: Grazing in fields

Note: Items can be stolen by thieves during night raids!`);
                result = true;
                break;

            case 'inventory':
                if (this.gameState.inventory.length === 0) {
                    this.output('Your inventory is empty.');
                } else {
                    this.output(`Inventory:
${this.gameState.inventory.map(item => `- ${item}`).join('\n')}`);
                }
                result = true;
                break;

            case 'pace':
                const newPace = this.gameState.pace === 'steady' ? 'fast' : 
                               this.gameState.pace === 'fast' ? 'grueling' : 'steady';
                this.gameState.pace = newPace;
                this.output(`Pace changed to ${newPace}`);
                result = true;
                break;

            case 'forage':
                if (this.gameState.day === this.gameState.lastForageDay) {
                    this.output('You have already foraged today. Wait until tomorrow to forage again.');
                    result = true;
                }

                this.gameState.lastForageDay = this.gameState.day;
                
                if (Math.random() < 0.5) {
                    const foragedFood = Math.floor(Math.random() * 10) + 1;
                    const oldFood = this.gameState.food;
                    this.gameState.food = Math.min(this.gameState.maxFood, this.gameState.food + foragedFood);
                    const actualGain = this.gameState.food - oldFood;

                    if (actualGain < foragedFood) {
                        this.output(`Foraging successful!
Found ${foragedFood} lbs of edible plants.
But you could only carry ${actualGain} lbs. (${this.gameState.maxFood} lbs max)`);
                    } else {
                        this.output(`Foraging successful!
Found ${foragedFood} lbs of edible plants.`);
                    }
                } else {
                    this.output('You searched the area but found no edible plants.');
                }
                result = true;
                break;

            case 'hunt':
                const huntCost = 10;
                if (this.gameState.food < huntCost) {
                    this.output('Not enough food to go hunting. Need at least 10 lbs of food for the journey.');
                    result = true;
                }
                
                this.gameState.food -= huntCost;
                if (Math.random() < 0.6) {
                    let food = Math.floor(Math.random() * 30) + 10;
                    if (this.gameState.inventory.includes('rifle')) {
                        food *= 2;
                    }
                    
                    const oldFood = this.gameState.food;
                    this.gameState.food = Math.min(this.gameState.maxFood, this.gameState.food + food);
                    const actualGain = this.gameState.food - oldFood;
                    
                    if (actualGain < food) {
                        this.output(`Hunting expedition (-${huntCost} food)
Success! ${this.gameState.inventory.includes('rifle') ? 'Your rifle helped you find' : 'Found'} ${food} lbs of food.
But you could only carry ${actualGain} lbs. (${this.gameState.maxFood} lbs max)
Net gain: ${actualGain - huntCost} lbs of food.`);
                    } else {
                        this.output(`Hunting expedition (-${huntCost} food)
Success! ${this.gameState.inventory.includes('rifle') ? 'Your rifle helped you find' : 'Found'} ${food} lbs of food.
Net gain: ${food - huntCost} lbs of food.`);
                    }
                } else {
                    let message = `Hunting expedition (-${huntCost} food)\nThe hunt was unsuccessful. No food found.`;
                    
                    // 50% chance of injury on unsuccessful hunt
                    if (Math.random() < 0.5) {
                        const damagePercent = Math.floor(Math.random() * 21); // 0-20% damage
                        const damage = Math.floor(this.gameState.health * (damagePercent / 100));
                        this.gameState.health -= damage;
                        
                        // Add injury description based on damage severity
                        let injuryDesc;
                        if (damagePercent <= 5) {
                            injuryDesc = "You got some minor scrapes and bruises.";
                        } else if (damagePercent <= 10) {
                            injuryDesc = "You twisted your ankle during the chase.";
                        } else if (damagePercent <= 15) {
                            injuryDesc = "You fell into a ravine while tracking prey.";
                        } else {
                            injuryDesc = "You were charged by an angry buffalo!";
                        }
                        
                        message += `\n${injuryDesc} (-${damagePercent}% health)`;
                    }
                    
                    this.output(message);
                }
                result = true;
                break;

            case 'rest':
                if (this.gameState.day === this.gameState.lastRestDay) {
                    this.output('You have already rested today. Wait until tomorrow to rest again.');
                    result = true;
                }

                this.gameState.lastRestDay = this.gameState.day;
                this.gameState.health += 20;
                this.gameState.food -= 5;
                this.gameState.health = Math.min(100, this.gameState.health);
                this.output('You rested for a day. Health improved! The party will not travel today.');
                result = true;
                break;

            case 'quit':
                this.output('Ending your journey...');
                this.stop();
                result = true;
                break;

            default:
                result = false;
        }

        // Show status after every command if it hasn't been shown this day
        if (result && this.gameState.lastStatusUpdate !== this.gameState.day) {
            this.showStatus();
        }

        return result;
    }
}

// Export for use in terminal
window.OregonTrail = OregonTrail; 