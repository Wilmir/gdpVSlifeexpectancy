/*
*    main.js
*    Data Visualization with D3.js
*    Gapminder Clone
*/




const set = new Set();

let time = 0;
const height = 500;
const width = 800;
const margin = {top: 50, right: 20, bottom: 100, left: 80};

const innerHeight = height - margin.top - margin.bottom;
const innerWidth = width - margin.left - margin.right;

const svg = d3.select('#chart-area')
			.append('svg')
			.attr('height',height)
			.attr('width', width);

const g = svg.append('g')
			.attr('height', innerHeight)
			.attr('width', innerWidth)
			.attr('transform', `translate(${margin.left},${margin.top})`);

const x = d3.scaleLog()
			.base(10)
			.domain([142, 150000])
			.range([0,innerWidth]);

const y = d3.scaleLinear()
			.domain([0,90])
			.range([innerHeight,0]);

const area = d3.scaleLinear()
			.domain([2000,1400000000])
			.range([25*Math.PI,1500*Math.PI]);

const continentColor = d3.scaleOrdinal( d3.schemeSet2); 

const xAxis = d3.axisBottom(x)
		.tickValues([400,4000,40000])
		.tickFormat(d3.format("$"));

		g.append('g')
			.attr('transform',`translate(0,${innerHeight})`)
			.call(xAxis);

const yAxis = d3.axisLeft(y);

	g.append('g').call(yAxis);



const yearLabel = g.append("text")
					.text("1800")
					.attr("font-size","35px")
					.attr("fill", "grey")
					.attr("x",0.85*innerWidth)
					.attr("y",0.9*innerHeight);

const incomeLabel = g.append("text")
					.text("GDP Per Capita ($)")
					.attr("font-size", "18px")
					.attr("text-anchor","middle")
					.attr("x",innerWidth/2)
					.attr("y",innerHeight + margin.bottom/2)

const lifeExpectancyLavle = g.append("text")
					.text("Life Expectancy (years)")
					.attr("font-size", "18px")
					.attr("text-anchor","middle")
					.attr("transform","rotate(-90)")
					.attr("x",-170)
					.attr("y",-40);

d3.json("data/data.json").then(function(data){
	let end = data.length;

	data[200]["countries"].forEach(d => set.add(d.continent));

	console.log(set);



	//clean data
	const formattedData = data.map(year => {
		return {countries: year["countries"]
							.filter(country => country.income && country.life_exp)
							.map(country => {
								country.income = +country.income;
								country.life_exp = +country.life_exp;
								return country;
				}),
				year: year["year"]}
	})

	d3.interval(function(){
		update(formattedData, time);
		if(time < end - 1 ){
			time++;
		}else{
			time = 0;
		}
	},100);

	update(formattedData,0);

})

function update(data, time){

	const t = d3.transition().duration(100);

	let countries = data[time].countries;

	const circles = g.selectAll('circle')
					 .data(countries, d => d.country);
	
	circles.exit().remove();

	circles.enter()
		.append('circle')
		.merge(circles)
		.attr('fill', d => continentColor(d.continent))
		.transition(t)
			.attr('r', d => Math.sqrt(area(d.population)/Math.PI))
			.attr('cx',d => x(d.income))
			.attr('cy', d => y(d.life_exp));

	yearLabel.transition(t)
			.text(data[time].year);
	
}