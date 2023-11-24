function _1(md){return(
md`# HW6`
)}

function _2(md){return(
md`Ref: https://observablehq.com/d/3b039b075022c35e`
)}

function _artistpublic(__query,FileAttachment,invalidation){return(
__query(FileAttachment("artistPublic.csv"),{from:{table:"artistPublic"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _artistver(__query,FileAttachment,invalidation){return(
__query(FileAttachment("artistVer.csv"),{from:{table:"artistVer"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _artist_columnKey(){return(
"3）從1到5級距，您認為藝術產業的碳排放量在那個相對位置？"
)}

function _artist_ColumnAns(artistver,artist_columnKey){return(
artistver.map(row => row[artist_columnKey])
)}

function _artistver_uniqueValues(artist_ColumnAns){return(
[...new Set(artist_ColumnAns)].sort()
)}

function _artist_counts(artistver_uniqueValues,artist_ColumnAns){return(
artistver_uniqueValues.map(val => ({
  value: val,
  count: artist_ColumnAns.filter(v => v === val).length
}))
)}

function _artistpublic_columnKey(artistpublic){return(
Object.keys(artistpublic[0])[4]
)}

function _artistpublic_ColumnAns(artistpublic,artistpublic_columnKey){return(
artistpublic.map(row => String(row[artistpublic_columnKey]))
)}

function _artistpublic_uniqueValues(artistpublic_ColumnAns){return(
[...new Set(artistpublic_ColumnAns)].sort()
)}

function _artistpublic_counts(artistpublic_uniqueValues,artistpublic_ColumnAns){return(
artistpublic_uniqueValues.map(val => ({
  value: val,
  count: artistpublic_ColumnAns.filter(v => v === String(val)).length
}))
)}

function _data(artist_counts,artistpublic_counts){return(
artist_counts.flatMap((item, index) => ([
  {
    value: item.value,
    count: item.count,
    series: 'artist'
  },
  {
    value: item.value,
    count: artistpublic_counts[index].count,
    series: 'artistpublic'
  }
]))
)}

function _14(md){return(
md`# Simple baseline`
)}

function _15(md){return(
md`利用Plot完成堆疊柱狀圖 & 加入Checkbox input使其可選擇呈現的資料集`
)}

function _selectedSeriesSimple(Inputs){return(
Inputs.checkbox(["artist", "artistpublic"], {label: "Choose datasets", value: ["artist", "artistpublic"]})
)}

function _17(Plot,artist_columnKey,data,selectedSeriesSimple){return(
Plot.plot({
  height: 600,
  title: artist_columnKey,
  x: {
    label: 'Value',
    domain: data.map(d => d.value),
    padding: 0.1
  },
  y: {
    label: 'Count',
    grid: true
  },
  color: {
    domain: ['artist', 'artistpublic'],
    range: ['	#00FFFF', '#921AFF'],
    legend: true
  },
  marks: [
    Plot.barY(data.filter(d => selectedSeriesSimple.includes(d.series)), Plot.stackY({ 
      x: "value",
      y: "count",
      fill: "series",
      title: d => `${d.series}\nvalue: ${d.value}\ncount: ${d.count}`
    }))
  ]
})
)}

function _18(md){return(
md`# Medium baseline`
)}

function _19(md){return(
md`利用SVG完成堆疊柱狀圖 (含Checkbox) & 加入D3的過渡效果`
)}

function _selectedSeriesMedium(Inputs){return(
Inputs.checkbox(["artist", "artistpublic"], {label: "Choose datasets", value: ["artist", "artistpublic"]})
)}

function _chartMedium(data,selectedSeriesMedium,d3)
{
  const margin = {top: 20, right: 30, bottom: 30, left: 40};
  const width = 500 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const keys = Array.from(new Set(data.map(d => d.series)));
  
  const filteredData = data.filter(d => selectedSeriesMedium.includes(d.series));

  let grouped = Array.from(d3.group(filteredData, d => d.value), ([key, value]) => {
    return {value: key, ...Object.fromEntries(value.map(obj => [obj.series, obj.count]))};
  });

  // stack
  const stack = d3.stack().keys(keys);
  const series = stack(grouped);
  
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.value))
    .range([0, width])
    .padding(0.1);

  const yMax = d3.max(series, serie => d3.max(serie, d => d[1]));
  const yScale = d3.scaleLinear()
    .domain([0, yMax]).nice()
    .range([height, 0]);

  const colorScale = d3.scaleOrdinal()
    .domain(keys)
    .range(['#00FFFF', '#921AFF']);

  const svg = d3.create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  series.forEach((serie) => {
    let bars = g.append("g")
      .attr("fill", colorScale(serie.key))
      .selectAll("rect")
      .data(serie);

    bars.enter().append("rect")
      .attr("x", d => xScale(d.data.value))
      .attr("y", height)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .transition() 
      .duration(1000)
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]));
  });

  // x axis
  g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  // y axis
  g.append("g")
    .call(d3.axisLeft(yScale));

  return svg.node();
}


function _22(md){return(
md`# Strong baseline`
)}

function _23(md){return(
md`利用SVG製成的堆疊柱狀圖添加陰影效果 & 添加滑鼠游標偵測效果`
)}

function _selectedSeriesStrong(Inputs){return(
Inputs.checkbox(["artist", "artistpublic"], {label: "Choose datasets", value: ["artist", "artistpublic"]})
)}

function _chartStrong(data,selectedSeriesStrong,d3)
{
  const margin = {top: 20, right: 30, bottom: 30, left: 40};
  const width = 500 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const keys = Array.from(new Set(data.map(d => d.series)));
  
  const filteredData = data.filter(d => selectedSeriesStrong.includes(d.series));

  let grouped = Array.from(d3.group(filteredData, d => d.value), ([key, value]) => {
    return {value: key, ...Object.fromEntries(value.map(obj => [obj.series, obj.count]))};
  });

  // stack
  const stack = d3.stack().keys(keys);
  const series = stack(grouped);
  
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.value))
    .range([0, width])
    .padding(0.1);

  const yMax = d3.max(series, serie => d3.max(serie, d => d[1]));
  const yScale = d3.scaleLinear()
    .domain([0, yMax]).nice()
    .range([height, 0]);

  const colorScale = d3.scaleOrdinal()
    .domain(keys)
    .range(['#00FFFF', '#921AFF']);

  const svg = d3.create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  
  const defs = svg.append("defs");
  const filter = defs.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%");
  
  filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 4)
    .attr("result", "blur");

  filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 4)
    .attr("dy", 4)
    .attr("result", "offsetBlur");

  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode")
     .attr("in", "offsetBlur");
  feMerge.append("feMergeNode")
     .attr("in", "SourceGraphic");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  series.forEach((serie) => {
    let bars = g.append("g")
      .attr("fill", colorScale(serie.key))
      .selectAll("rect")
      .data(serie);
  
    bars.enter().append("rect")
      .attr("x", d => xScale(d.data.value))
      .attr("y", height)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .on("mouseover", function(d) {
        d3.select(this).attr("fill", "#CA7A2C");
      })
      .on("mouseout", function(d) {
        d3.select(this).attr("fill", colorScale(serie.key));
        d3.select(".tooltip").remove();
      })
      .transition()
      .duration(1000)
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("filter", "url(#drop-shadow)");
  });

  // x axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  // y axis
  g.append("g")
    .call(d3.axisLeft(yScale));

  return svg.node();
}


export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["artistPublic.csv", {url: new URL("./artistPublic.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["artistVer.csv", {url: new URL("./artistVer.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("artistpublic")).define("artistpublic", ["__query","FileAttachment","invalidation"], _artistpublic);
  main.variable(observer("artistver")).define("artistver", ["__query","FileAttachment","invalidation"], _artistver);
  main.variable(observer("artist_columnKey")).define("artist_columnKey", _artist_columnKey);
  main.variable(observer("artist_ColumnAns")).define("artist_ColumnAns", ["artistver","artist_columnKey"], _artist_ColumnAns);
  main.variable(observer("artistver_uniqueValues")).define("artistver_uniqueValues", ["artist_ColumnAns"], _artistver_uniqueValues);
  main.variable(observer("artist_counts")).define("artist_counts", ["artistver_uniqueValues","artist_ColumnAns"], _artist_counts);
  main.variable(observer("artistpublic_columnKey")).define("artistpublic_columnKey", ["artistpublic"], _artistpublic_columnKey);
  main.variable(observer("artistpublic_ColumnAns")).define("artistpublic_ColumnAns", ["artistpublic","artistpublic_columnKey"], _artistpublic_ColumnAns);
  main.variable(observer("artistpublic_uniqueValues")).define("artistpublic_uniqueValues", ["artistpublic_ColumnAns"], _artistpublic_uniqueValues);
  main.variable(observer("artistpublic_counts")).define("artistpublic_counts", ["artistpublic_uniqueValues","artistpublic_ColumnAns"], _artistpublic_counts);
  main.variable(observer("data")).define("data", ["artist_counts","artistpublic_counts"], _data);
  main.variable(observer()).define(["md"], _14);
  main.variable(observer()).define(["md"], _15);
  main.variable(observer("viewof selectedSeriesSimple")).define("viewof selectedSeriesSimple", ["Inputs"], _selectedSeriesSimple);
  main.variable(observer("selectedSeriesSimple")).define("selectedSeriesSimple", ["Generators", "viewof selectedSeriesSimple"], (G, _) => G.input(_));
  main.variable(observer()).define(["Plot","artist_columnKey","data","selectedSeriesSimple"], _17);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer()).define(["md"], _19);
  main.variable(observer("viewof selectedSeriesMedium")).define("viewof selectedSeriesMedium", ["Inputs"], _selectedSeriesMedium);
  main.variable(observer("selectedSeriesMedium")).define("selectedSeriesMedium", ["Generators", "viewof selectedSeriesMedium"], (G, _) => G.input(_));
  main.variable(observer("chartMedium")).define("chartMedium", ["data","selectedSeriesMedium","d3"], _chartMedium);
  main.variable(observer()).define(["md"], _22);
  main.variable(observer()).define(["md"], _23);
  main.variable(observer("viewof selectedSeriesStrong")).define("viewof selectedSeriesStrong", ["Inputs"], _selectedSeriesStrong);
  main.variable(observer("selectedSeriesStrong")).define("selectedSeriesStrong", ["Generators", "viewof selectedSeriesStrong"], (G, _) => G.input(_));
  main.variable(observer("chartStrong")).define("chartStrong", ["data","selectedSeriesStrong","d3"], _chartStrong);
  return main;
}
