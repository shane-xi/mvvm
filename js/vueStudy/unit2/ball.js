var Ball = function (weight, people, history) {
	this.weight = weight;
	this.people = people;
	this.history = history;
}
Ball.prototype = {
	constructor: Ball,
	setWeight: function (weight) {
		this.weight = weight;
	},
	setPepole: function (people) {
		this.people = people;
	},
	setHistory: function (history) {
		this.history = history;
	},
	getWeight: function () {
		console.log(this.weight)
	},
	getPeople: function () {
		console.log(this.people)
	},
	getHistory: function () {
		console.log(this.history)
	}
}
var FootBall = new Ball();
var Sport = function (sport) {
	if (sport === 'footBall') {
		return FootBall;
	}
}