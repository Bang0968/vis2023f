function _1(md){return(
md`# HW2 Strong baseline (2pt)`
)}

function _data(FileAttachment){return(
FileAttachment("data.json").json()
)}

function _constellations(){return(
[ "牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"]
)}

function _barData(){return(
[]
)}

function _5(barData,data,constellations)
{
  barData.length = 0;
  data.forEach ( x => {
    var constellation = constellations[x.Constellation];
    var engGender = x.Gender === "男" ? "male" : "female"
    var index = barData.findIndex((printRow) => printRow.Constellation === constellation && printRow.Gender === engGender);
    if (index == -1) {
      let printRow = {
        ConstellationNumber: x.Constellation,
        Constellation: constellation,
        Gender: engGender,
        Count: 1
      };
      barData.push(printRow);
    } else {
      barData[index].Count += 1;
    }
  });
  
  return barData;
}


function _plot3(Inputs){return(
Inputs.form({
	mt:  Inputs.range([0, 100], {label: "marginTop", step: 1}),
	mr:  Inputs.range([0, 100], {label: "marginRight", step: 1}),
	mb:  Inputs.range([0, 100], {label: "marginBottom", step: 1}),
	ml:  Inputs.range([0, 100], {label: "marginLeft", step: 1}),
})
)}

function _7(Plot,plot3,barData){return(
Plot.plot({
  marginTop: plot3.mt,
  marginRight: plot3.mr,
  marginBottom: plot3.mb,
  marginLeft: plot3.ml,
  
  grid: true,
  color: {scheme: "Sinebow", legend: true},
  y: {label: "Count"},
  marks: [
    Plot.ruleY([0]),
    Plot.barY(barData, {
      x: "Constellation",
      y: "Count",
      fill: "Gender",
      channels: {
        ConstellationNumber: "ConstellationNumber",
      },
      tip: {
        format: {
          y: (d) => `: ${d}`,
          x: (d) => `: ${d}`,
          fill: (d) => `: ${d}`,
          ConstellationNumber: false
        }
      },
      sort: {x: "ConstellationNumber"}
    }),
  ]
})
)}

function _histogData(){return(
[]
)}

function _9(histogData,data,constellations)
{
 histogData.length = 0;
  data.forEach ( x => {
    let constellation = constellations[x.Constellation];
    let printRow = {
      ConstellationNumber: x.Constellation,
      Constellation: constellation,
      Gender: x.Gender,
    };
   histogData.push(printRow);
  });
  return histogData;
}


function _10(Plot,plot3,constellations,histogData){return(
Plot.plot({
  marginTop: plot3.mt,
  marginRight: plot3.mr,
  marginBottom: plot3.mb,
  marginLeft: plot3.ml,

  color: {legend: true},
  x: {grid: true, label: "Constellation", ticks: 10, tickFormat: (d) => constellations[d]},
  y: {grid: true, label: "Count"},
  marks: [
    Plot.rectY(histogData,
      Plot.binX(
        {y: "Count"},
        {
          x: "ConstellationNumber",
          fill: "Gender",
          title: (data) => `Constellation: ${data.Constellation}\nGender: ${data.Gender}`,
          interval: 1,
          tip: true,
        },
      ),
    ),    
  ]
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["data.json", {url: new URL("../data.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("constellations")).define("constellations", _constellations);
  main.variable(observer("barData")).define("barData", _barData);
  main.variable(observer()).define(["barData","data","constellations"], _5);
  main.variable(observer("viewof plot3")).define("viewof plot3", ["Inputs"], _plot3);
  main.variable(observer("plot3")).define("plot3", ["Generators", "viewof plot3"], (G, _) => G.input(_));
  main.variable(observer()).define(["Plot","plot3","barData"], _7);
  main.variable(observer("histogData")).define("histogData", _histogData);
  main.variable(observer()).define(["histogData","data","constellations"], _9);
  main.variable(observer()).define(["Plot","plot3","constellations","histogData"], _10);
  return main;
}
