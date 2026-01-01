// cards.extra.js
// Place additional card definitions here so they can be maintained separately
// Export an array named `extraCards` with card objects matching the shape used
// by `cards.js`. Example:
// export const extraCards = [ { id: 'mycard_c_01', name: 'My Card', title: '...', rank: 'C', power: 20, attackRange: [3,9], health: 70, type: 'Support', image: 'https://...' } ];

export const extraCards = [
	{
		id: "luffy_z_newyears_2025",
		name: "(NEW YEARS) Monkey D Luffy",
		title: "Event card",
		rank: "Z",
		power: 600,
		attackRange: [90, 130],
		health: 750,
		type: "Attack",
		specialAttack: { name: "Gomu Gomu no Bajrang Gun", range: [200, 250], gif: "https://files.catbox.moe/toppyn.gif" },
		ability: null,
		image: "https://files.catbox.moe/iteabf.jpg",
		isUpgrade: false,
		pullable: false
	}
];
