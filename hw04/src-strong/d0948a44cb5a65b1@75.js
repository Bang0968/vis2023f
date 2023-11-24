function _1(md){return(
md`# HW 4 Strong baseline`
)}

function _2(md){return(
md`Ref: https://observablehq.com/d/c84affd948a1e733`
)}

function _artist(__query,FileAttachment,invalidation){return(
__query(FileAttachment("artist.csv"),{from:{table:"artist"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _questionOne(artist){return(
Object.keys(artist[0])[2]
)}

function _questionTwo(artist){return(
Object.keys(artist[0])[15]
)}

function _data(artist,questionOne,questionTwo,buildHierarchy)
{
  let innerAnswer = artist.map(row => row[questionOne]);
  let outerAnswer = artist.map(row => row[questionTwo]);

  let combinedAnswers = innerAnswer.map((innAns, index) => innAns + '-' + outerAnswer[index])

  let reformatAnswers = combinedAnswers.map(item => {
    const [prefix, values] = item.split('-');
    const splitValues = values.split(';').map(value => value.trim());
    return splitValues.map(value => `${prefix}-${value}`);
  }).reduce((acc, curr) => acc.concat(curr), []);

  let answerCounts = {};
  reformatAnswers.forEach(reformatAns => {
    answerCounts[reformatAns] = (answerCounts[reformatAns] || 0) + 1;
  })

  let csvData = Object.entries(answerCounts).map(([answer, count]) => [answer, String(count)]);

  return buildHierarchy(csvData);
}


function _buildHierarchy(){return(
function buildHierarchy(csv) {
  // Helper function that transforms the given CSV into a hierarchical format.
  const root = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    const size = +csv[i][1];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split("-");
    let currentNode = root;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = { name: nodeName, children: [] };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        childNode = { name: nodeName, value: size };
        children.push(childNode);
      }
    }
  }
  return root;
}
)}

function _breadcrumb(d3,breadcrumbWidth,breadcrumbHeight,sunburst,breadcrumbPoints,color)
{
  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${breadcrumbWidth * 10} ${breadcrumbHeight}`)
    .style("font", "12px sans-serif")
    .style("margin", "5px");

  const g = svg
    .selectAll("g")
    .data(sunburst.sequence)
    .join("g")
    .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`);

    g.append("polygon")
      .attr("points", breadcrumbPoints)
      .attr("fill", d => color(d.data.name))
      .attr("stroke", "white");

    g.append("text")
      .attr("x", (breadcrumbWidth + 10) / 2)
      .attr("y", 15)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => {
        if(d.data.name === "有，以行動或計畫進行") {
          return "實際進行";
        }
        else if(d.data.name === "使用無毒媒材、再生材料、廢物利用素材等") {
          return "使用再生材料";
        }
        else if(d.data.name === "工作場所、活動展場的節約能源") {
          return "節約能源";
        }
        else if(d.data.name.length > 6)
        {
          return "其他答案";
        }
        return d.data.name;
      });

  svg
    .append("text")
    .text(sunburst.percentage > 0 ? sunburst.percentage + "%" : "")
    .attr("x", (sunburst.sequence.length + 0.5) * breadcrumbWidth)
    .attr("y", breadcrumbHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle");

  return svg.node();
}


function _sunburst(partition,data,d3,radius,questionOne,questionTwo,width,color,arc,mousearc)
{
  const root = partition(data);
  const svg = d3.create("svg");
  // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
  const element = svg.node();
  element.value = { sequence: [], percentage: 0.0 };

  // 使用foreignObject插入HTML
  const fo = svg
    .append("foreignObject")
    .attr("x", `${radius+50}px`)
    .attr("y", -10)
    .attr("width", radius*2)
    .attr("height", 350);
  
  const div = fo
    .append("xhtml:div")
    .style("color","#555")
    .style("font-size", "25px")
    .style("font-family", "Arial");

  d3.selectAll("div.tooltip").remove(); // clear tooltips from before
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", `tooltip`)
    .style("position", "absolute")
    .style("opacity", 0)

  const label = svg
    .append("text")
    .attr("text-anchor", "middle");
    //.style("visibility", "hidden");

  label//內圈問題
    .append("tspan")
    .attr("class", "question1")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", `${radius*2+50}px`)
    .attr("dy", "-6em")
    .attr("font-size", "2.5em")
    .attr("fill", "#BBB")
    .text(questionOne);

  label//外圈問題
    .append("tspan")
    .attr("class", "question2")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", `${radius*2+50}px`)
    .attr("dy", "-4em")
    .attr("font-size", "2.5em")
    .attr("fill", "#BBB")
    .text(questionTwo);

  label//答案
    .append("tspan")
    .attr("class", "sequence")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", `${radius*2+50}px`)
    .attr("dy", "-1em")
    .attr("font-size", "2.5em")
    .text("");

  label//占比%數
    .append("tspan")
    .attr("class", "percentage")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "0em")
    .attr("font-size", "5em")
    .attr("fill", "#555")
    .text("");

  label//數量
    .append("tspan")
    .attr("class", "dataValue")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "2em")
    .attr("font-size", "2em")
    .attr("fill", "#555")
    .text("");

  svg
    .attr("viewBox", `${-radius} ${-radius} ${width*2.2} ${width}`)
    .style("max-width", `${width*2}px`)
    .style("font", "12px sans-serif");

  const path = svg
    .append("g")
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("fill", d => color(d.data.name))
    .attr("d", arc);

  svg
    .append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseleave", () => {
      path.attr("fill-opacity", 1);
      //tooltip.text("");
      //label.style("visibility", null);
      // Update the value of this view
      element.value = { sequence: [], percentage: 0.0 };
      element.dispatchEvent(new CustomEvent("input"));
    })
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("d", mousearc)
    .on("mouseover", (_evt, d) => {
      if(d.data.name === "有，以行動或計畫進行") {
        tooltip
        .style("opacity", 1)
        .html(`實際進行<br><?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Uploaded to svgrepo.com" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .avocado_een{fill:#231F20;} .avocado_zeventien{fill:#CC4121;} .avocado_zes{fill:#FFFAEE;} .avocado_twintig{fill:#EAD13F;} .avocado_negentien{fill:#E0A838;} .avocado_achttien{fill:#D1712A;} .avocado_tien{fill:#C3CC6A;} .st0{fill:#A3AEB5;} .st1{fill:#788287;} .st2{fill:#6F9B45;} .st3{fill:#248EBC;} .st4{fill:#8D3E93;} .st5{fill:#3D3935;} .st6{fill:#D36781;} .st7{fill:#E598A3;} .st8{fill:#716558;} .st9{fill:#AF9480;} .st10{fill:#DBD2C1;} .st11{fill:#231F20;} </style> <g> <rect x="2.5" y="6.5" class="avocado_zes" width="27" height="21"></rect> <path class="avocado_een" d="M28,6V4h-1v2h-1V4h-1v2h-4V4h-1v2h-1V4h-1v2h-4V4h-1v2h-1V4h-1v2H7V4H6v2H5V4H4v2H2v22h28V6H28z M29,27H3V7h26V27z"></path> <path class="avocado_zeventien" d="M13,12H5v-2h8V12z"></path> <g> <g> <path class="avocado_achttien" d="M17,15H9v-2h8V15z"></path> </g> </g> <g> <g> <path class="avocado_negentien" d="M17,18H9v-2h8V18z"></path> </g> </g> <g> <g> <path class="avocado_twintig" d="M23,21h-8v-2h8V21z"></path> </g> </g> <path class="avocado_tien" d="M27,24h-4v-2h4V24z"></path> </g> </g></svg>`)
        .style("border-color", color(d.data.name));
      }
      else if(d.data.name === "沒有") {
        tooltip
        .style("opacity", 1)
        .html(`沒有行動<br><?xml version="1.0" encoding="utf-8"?><svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M34.999 17.999c0 9.389-7.611 17-17 17S1 27.388 1 17.999S8.611 1 17.999 1c9.388-.001 17 7.61 17 16.999z" fill="#000000"></path><path fill="#FFF" d="M20 8.5c0 1.38-.896 2.5-2 2.5c-1.105 0-2-1.12-2-2.5S16.895 6 18 6c1.104 0 2 1.119 2 2.5zm5.918 19.74L21 19.869v-5.371c.371.326.755.678 1.127 1.043l.925 2.774a.998.998 0 1 0 1.896-.632l-1-3a1 1 0 0 0-.241-.39C22.205 12.79 20.169 11 19 11h-2c-1.21 0-2.643 1.702-3.682 3.223l-3.765 1.882a1 1 0 0 0 .895 1.789l4-2c.155-.078.288-.195.385-.339c.202-.303.421-.605.643-.893l1.101 3.853l-3.819 2.183A1.498 1.498 0 0 0 12 22v7a1.5 1.5 0 1 0 3 0v-6.13l3.207-1.833l5.125 8.723a1.497 1.497 0 0 0 2.053.533a1.5 1.5 0 0 0 .533-2.053z"></path><path fill="#DD2E44" d="M18 0C8.059 0 0 8.059 0 18s8.059 18 18 18s18-8.059 18-18S27.941 0 18 0zm16 18c0 3.968-1.453 7.591-3.845 10.388L7.612 5.845A15.927 15.927 0 0 1 18 2c8.837 0 16 7.164 16 16zM2 18c0-3.968 1.453-7.592 3.845-10.388l22.543 22.544A15.924 15.924 0 0 1 18 34C9.164 34 2 26.837 2 18z"></path></g></svg>`)
        .style("border-color", color(d.data.name));
      }
      else if(d.data.name === "不清楚") {
        tooltip
        .style("opacity", 1)
        .html(`不清楚<br><?xml version="1.0" encoding="iso-8859-1"?><svg fill="#000000" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.cls-1{fill:none;}</style></defs><title>unknown</title><circle cx="16" cy="22.5" r="1.5"></circle><path d="M17,19H15V15h2a2,2,0,0,0,0-4H15a2.0023,2.0023,0,0,0-2,2v.5H11V13a4.0045,4.0045,0,0,1,4-4h2a4,4,0,0,1,0,8Z" transform="translate(0)"></path><path d="M16,30a2.0763,2.0763,0,0,1-1.4732-.6094L2.6094,17.4732a2.0855,2.0855,0,0,1,0-2.9464L14.5268,2.6094a2.0855,2.0855,0,0,1,2.9464,0L29.3906,14.5268a2.0855,2.0855,0,0,1,0,2.9464L17.4732,29.3906A2.0763,2.0763,0,0,1,16,30ZM16,3.9992a.0841.0841,0,0,0-.0591.0244L4.0236,15.9409a.0838.0838,0,0,0,0,.1182L15.9409,27.9764a.0842.0842,0,0,0,.1182,0L27.9764,16.0591a.0838.0838,0,0,0,0-.1182L16.0591,4.0236A.0841.0841,0,0,0,16,3.9992Z" transform="translate(0)"></path><rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" class="cls-1" width="32" height="32"></rect></g></svg>`)
        .style("border-color", color(d.data.name));
      }
      else
      {
        tooltip
        .style("opacity", 1)
        .html(`${d.data.name}`)
        .style("border-color", color(d.data.name));
      }
    })
    .on("mousemove", (evt, d) => {
      tooltip
        .style("top", evt.pageY - 10 + "px")
        .style("left", evt.pageX + 10 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    })
    .on("mouseenter", (event, d) => {
      // Get the ancestors of the current segment, minus the root

      //introduce
      if(d.data.name === "北部")
      {
        div
          .html("<ul><li>「北部地區」包括臺北市、新北市、基隆市、宜蘭縣、桃園市、新竹縣及新竹市等7個縣市。 您可以從臺灣最高樓——臺北101俯瞰臺北美景；前往故宮博物院一窺歷史典藏文物瑰寶；或走進知名老街如：九份、淡水、鶯歌、三峽等感受古街風情記憶。</li></ul>");
      }
      else if(d.data.name === "中部")
      {
        div
          .html("<ul><li>「中部地區」包括苗栗縣、臺中市、彰化縣、南投縣及雲林縣等5個縣市，位於臺灣心臟地帶，常年氣候舒適，尤其是臺中市，四季氣溫宜人，非常適合旅行。 中部地區擁有多處老少皆宜的渡假村及遊樂中心，包含苗栗西湖渡假村、臺中麗寶樂園、南投泰雅渡假村、九族文化村及雲林劍湖山世界等。</li></ul>");
      }
      else if(d.data.name === "南部")
      {
        div
          .html("<ul><li>「南部區域」即為「南台灣」，包括嘉義縣、嘉義市、臺南市、高雄市、屏東縣及澎湖縣，為中華民國官方標準劃分方式；面積約10745.048平方公里。 南台灣現時主要以高雄市、台南市為中心。 產業包括重工業，其中高雄地區是台灣主要的石油化學工業、造船業與鋼鐵業基中地。</li></ul>");
      }
      else if(d.data.name === "東部")
      {
        div
          .html("<ul><li>「東部地區」擁有豐富的生態資源、悠久的農業文化和純樸善良的在地居民，是臺灣的「後花園」，非常適合慢活養生之旅，行走在這塊淨土上，放慢你的呼吸頻率，大口吸入甜甜的空氣香，long stay是最好的行程安排。 太魯閣公園是臺灣必遊景點，以峽谷景觀聞名，雄偉壯麗的山川景色，多處景點展現出原始的險峻地形與奧妙的地質面貌。</li></ul>");
      }  
      else
      {
        div.html("");
      }
      
      //dataValue
      label
        .style("visibility", null)
        .select(".dataValue")
        .text("計數："+d.value);
      
      //question
      if(d.depth-1 === 0)
      {
        label
          .style("visibility", null)
          .select(".question1")
          .attr("fill", "#000");
        label
          .style("visibility", null)
          .select(".question2")
          .attr("fill", "#BBB");
      }
      else if(d.depth-1 === 1)
      {
        label
          .style("visibility", null)
          .select(".question1")
          .attr("fill", "#BBB");
        label
          .style("visibility", null)
          .select(".question2")
          .attr("fill", "#000");
      }
      
      const sequence = d
        .ancestors()
        .reverse()
        .slice(1);
      // Highlight the ancestors
      path.attr("fill-opacity", node =>
        sequence.indexOf(node) >= 0 ? 1.0 : 0.3
      );
      label
        .style("visibility", null)
        .select(".sequence")
        //.style("visibility", "visible")
        .attr("fill", sequence => color(d.data.name))
        .text(d.data.name);
      const percentage = ((100 * d.value) / root.value).toPrecision(3);
      label
        .style("visibility", null)
        .select(".percentage")
        .text(percentage + "%");

      /*tooltip
        .text(d.data.name);*/
      
      // Update the value of this view with the currently hovered sequence and percentage
      element.value = { sequence, percentage };
      element.dispatchEvent(new CustomEvent("input"));
    });     

  return element;
}


function _10(md){return(
md`<h2>結論</h2>
<h3>從上圖中，我們可以看出：
  <ul>
    <li>來自北部的藝術工作者占此問卷的多數</li>
    <li>各地區大多數藝術工作者的工作處會實際推動永續事務</li>
    <li>藝術工作者的工作處對於永續事務採取的行動主要有三種: 實際按照計畫推動、沒有在推動永續事務、不清楚永續事務</li>
  </ul>
</h3>`
)}

function _width(){return(
640
)}

function _radius(){return(
320
)}

function _partition(d3,radius){return(
data =>
  d3.partition().size([2 * Math.PI, radius * radius])(
    d3
      .hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
  )
)}

function _mousearc(d3,radius){return(
d3
  .arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(radius)
)}

function _color(d3){return(
d3
  .scaleOrdinal()
  .domain(["北部", "中部", "南部", "東部", "國外", "有，以行動或計畫進行", "沒有", "不清楚"])
  //.range(d3.schemePaired)
  .range(["#ff8360","#e8e288","#7dce82","#3cdbd3","#00fff5","#03045e", "#0077b6", "#00b4d8"])
  .unknown("#e9eaec")
)}

function _arc(d3,radius){return(
d3
  .arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .padAngle(1 / radius)
  .padRadius(radius)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(d => Math.sqrt(d.y1) - 1)
)}

function _breadcrumbWidth(){return(
75
)}

function _breadcrumbHeight(){return(
30
)}

function _breadcrumbPoints(breadcrumbWidth,breadcrumbHeight){return(
function breadcrumbPoints(d, i) {
  const tipWidth = 10;
  const points = [];
  points.push("0,0");
  points.push(`${breadcrumbWidth},0`);
  points.push(`${breadcrumbWidth + tipWidth},${breadcrumbHeight / 2}`);
  points.push(`${breadcrumbWidth},${breadcrumbHeight}`);
  points.push(`0,${breadcrumbHeight}`);
  if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${tipWidth},${breadcrumbHeight / 2}`);
  }
  return points.join(" ");
}
)}

function _20(htl){return(
htl.html`<style>
.tooltip {
  padding: 8px 12px;
  color: white;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.5);
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.2);
  pointer-events: none;
  transform: translate(-50%, -100%);
  font-family: "Helvetica", sans-serif;
  background: rgba(20,10,30,0.6);
  transition: 0.2s opacity ease-out, 0.1s border-color ease-out;
}
</style>`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["artist.csv", {url: new URL("./artist.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("artist")).define("artist", ["__query","FileAttachment","invalidation"], _artist);
  main.variable(observer("questionOne")).define("questionOne", ["artist"], _questionOne);
  main.variable(observer("questionTwo")).define("questionTwo", ["artist"], _questionTwo);
  main.variable(observer("data")).define("data", ["artist","questionOne","questionTwo","buildHierarchy"], _data);
  main.variable(observer("buildHierarchy")).define("buildHierarchy", _buildHierarchy);
  main.variable(observer("breadcrumb")).define("breadcrumb", ["d3","breadcrumbWidth","breadcrumbHeight","sunburst","breadcrumbPoints","color"], _breadcrumb);
  main.variable(observer("viewof sunburst")).define("viewof sunburst", ["partition","data","d3","radius","questionOne","questionTwo","width","color","arc","mousearc"], _sunburst);
  main.variable(observer("sunburst")).define("sunburst", ["Generators", "viewof sunburst"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], _10);
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("radius")).define("radius", _radius);
  main.variable(observer("partition")).define("partition", ["d3","radius"], _partition);
  main.variable(observer("mousearc")).define("mousearc", ["d3","radius"], _mousearc);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("arc")).define("arc", ["d3","radius"], _arc);
  main.variable(observer("breadcrumbWidth")).define("breadcrumbWidth", _breadcrumbWidth);
  main.variable(observer("breadcrumbHeight")).define("breadcrumbHeight", _breadcrumbHeight);
  main.variable(observer("breadcrumbPoints")).define("breadcrumbPoints", ["breadcrumbWidth","breadcrumbHeight"], _breadcrumbPoints);
  main.variable(observer()).define(["htl"], _20);
  return main;
}
