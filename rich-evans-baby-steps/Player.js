class Player {
	constructor() {
		this.health = 20;
		this.healthyThreshold = 6;
		this.bound = {};
		this.enemy = {};
		this.stairs = {};
		this.wall = {};
	}

	playTurn(warrior) {
		this.checkSurroundings(warrior);
		this.checkStatus(warrior);
		this.act(warrior, this.chooseAction(this));
	}

	checkSurroundings(warrior) {
		if (!this.wall.backward) this.evaluateSpaces(warrior, "backward");
		if (!this.wall.forward) this.evaluateSpaces(warrior, "forward");
	}

	evaluateSpaces(warrior, dir) {
		const view = warrior.look(dir);
		const [boundInd, enemyInd, stairsInd, wallInd] = view.reduceRight(
			(acc, space, ind) => {
				if (space.isUnit()) {
					if (space.getUnit().isBound()) acc[0] = ind + 1;
					if (space.getUnit().isEnemy()) acc[1] = ind + 1;
				} else if (space.isStairs()) acc[2] = ind + 1;
				else if (space.isWall()) acc[3] = ind + 1;
				return acc;
			},
			[0, 0, 0, 0],
		);

		this.bound[dir] = boundInd;
		this.enemy[dir] = enemyInd;
		if (!this.stairs[dir]) this.stairs[dir] = !boundInd && !enemyInd && stairsInd;
		if (!this.wall[dir]) this.wall[dir] = !boundInd && !enemyInd && !stairsInd && wallInd;
	}

	checkStatus(warrior) {
		this.isHealthy = this.health >= this.healthyThreshold;
		this.isShotAt = this.enemy.forward !== 1 && this.enemy.backward !== 1 && warrior.health() < this.health;
		this.health = warrior.health();
	}

	chooseAction({ bound, enemy, stairs, wall }) {
		return this.manageRest() || this.manageBound(bound) || this.manageEnemy(enemy) || this.manageMovement(stairs, wall);
	}

	manageRest() {
		if (!this.isShotAt && !this.isHealthy) return "rest";
	}

	manageBound({ backward, forward }) {
		if (forward) return `${forward === 1 ? "rescue" : "walk"} forward`;
		if (backward) return `${backward === 1 ? "rescue" : "walk"} backward`;
	}

	manageEnemy({ backward, forward }) {
		if (backward && this.isHealthy) return `${backward === 1 ? "attack" : "shoot"} backward`;
		if (backward && !this.isHealthy) return "walk forward";
		if (forward && this.isHealthy) return `${forward === 1 ? "attack" : "shoot"} forward`;
		if (forward && !this.isHealthy) return "walk backward";
	}

	manageMovement({ backward: sBackward, forward: sForward }, { backward: wBackward, forward: wForward }) {
		if (sForward && !wBackward) return "walk backward";
		if (sBackward && !wForward) return "walk forward";
		if (!wForward) return "walk forward";
		if (!wBackward) return "walk backward";
	}

	act(warrior, actionStr) {
		let [action, dir] = actionStr.split(" ");
		warrior[action](dir);
	}
}
