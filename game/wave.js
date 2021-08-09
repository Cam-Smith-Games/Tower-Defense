class Wave {

    constructor(startTime, enemyCount, enemyType, spawnFrequency = 1) {
        this.startTime = startTime;
        this.enemyCount = enemyCount;
        this.enemyType = enemyType;
        this.spawnFrequency = spawnFrequency;

        this.timer = 0;
        this.enemiesSpawned = 0;
    }


    begin() {
        // set interval
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer > this.spawnFrequency) {
            this.timer = 0;
            let enemy = new this.enemyType();
            game.enemies.push(enemy);
            if (++this.enemiesSpawned >= this.enemyCount) {
                return true;
            }
        }

        return false;
    }
}

