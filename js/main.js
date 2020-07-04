/*
*    main.js
*    Data Visualization with D3.js
*    Gapminder Clone
*/

let time = 0;
let interval;
let formattedData;
let end;
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

const continentColor = d3.scaleOrdinal(d3.schemeCategory10); 

const xAxis = d3.axisBottom(x)
		.tickValues([400,4000,40000])
		.tickFormat(d3.format("$"));

		g.append('g')
			.attr('transform',`translate(0,${innerHeight})`)
			.call(xAxis);

const yAxis = d3.axisLeft(y);

	g.append('g').call(yAxis);

let continents = ["europe","asia","americas","africa"];

//Adding Legend
const legendGroup = g.append('g')
					.attr('transform',`translate(${innerWidth - 40},${innerHeight - 150})`);

continents.forEach((continent,i) =>{
	const legendRow = legendGroup.append('g')
						.attr('transform',`translate(0,${i*20})`);

	legendRow.append('rect')
			.attr('fill',continentColor(continent))
			.attr('height',10)
			.attr('width',10);

	legendRow.append('text')
			.attr('x', -10)
			.attr('y', 10)
			.attr('text-anchor','end')
			.style('text-transform','capitalize')
			.text(continent);
	}
)

//Adding Tooltip
const tip = d3.tip().attr('class','d3-tip')
				.html(d => {
					let text = `<strong>Country: </strong><span style = 'color:red'>${d.country}</span><br>`;
						text += `<strong>Continent: </strong><span style = 'color:red;text-transform:capitalize'>${d.continent}</span><br>`;
						text += `<strong>Life Expectancy: </strong><span style = 'color:red'>${d3.format("0.2f")(d.life_exp)}</span><br>`;
						text += `<strong>Income: </strong><span style = 'color:red'>${d3.format("$,.0f")(d.income)}</span><br>`;
						text += `<strong>Population: </strong><span style = 'color:red'>${d3.format(",.0f")(d.population)}</span><br>`;
					return text;
				});
g.call(tip);


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
	end = data.length;

	//clean data
	formattedData = data.map(year => {
		return {countries: year["countries"]
							.filter(country => country.income && country.life_exp)
							.map(country => {
								country.income = +country.income;
								country.life_exp = +country.life_exp;
								return country;
				}),
				year: year["year"]}
	})

	update(formattedData,0);

})


$("#play-button").on("click", function(){
	let button = $(this);
	if(button.text() === "Play"){
		button.text("Pause");
		interval = setInterval(step, 100);
	}else{
		button.text("Play");
		clearInterval(interval);
	}
})

$("#reset-button").on("click", function(){
	time = 0;
	update(formattedData, time);
})

$("#continent-select").on("change", function(){
	update(formattedData, time);
})

$("#date-slider").slider({
	min: 1800,
	max: 2014,
	step: 1,
	slide: function(event, ui){
		time = ui.value - 1800;
		update(formattedData, time);
	}
})

function step(){
	time = time < end - 1 ? time + 1 : 0;
	update(formattedData, time);
}

function update(data, time){

	const t = d3.transition().duration(100);

	let continent = $("#continent-select").val();

	let countries = data[time].countries
						.filter(country => {
						if(continent == "all"){
							return true;
						}else{
							return country.continent == continent;
						}
						});

	const circles = g.selectAll('circle')
					 .data(countries, d => d.country);
	
	circles.exit().remove();

	circles.enter()
		.append('circle')
		.attr('fill', d => continentColor(d.continent))
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.merge(circles)
		.transition(t)
			.attr('r', d => Math.sqrt(area(d.population)/Math.PI))
			.attr('cx',d => x(d.income))
			.attr('cy', d => y(d.life_exp));

	//Update the year label
	yearLabel.transition(t)
			.text(data[time].year);
	$("#year").innerHTML = data[time].year;

	$("#date-slider").slider("value",data[time].year);
}