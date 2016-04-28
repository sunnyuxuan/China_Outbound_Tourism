function makeMap(china, provinces){

    var color = d3.scale.threshold()
    .domain([0.8, 2, 4, 8, 16])
    .range(["#ffeee6", "#ffccb3", "#ff884d", "#ff661a", "#e64d00", "#802b00"]);

provinces.forEach(function(province){
var dataPro = province.name;
    var dataValue = +province.Percentage;
    var population = +province.Population;
    var res = +province.Residents;
     var story = province.Story;
    
    china.features.forEach(function(j){
    var chinaPro = j.properties.ADM1;
        if (dataPro == chinaPro) {
        j.properties.Percent = dataValue;
        j.properties.Population = population;
        j.properties.Residents = res;
            j.properties.Story = story;
        }
    });

});
 
    var center = d3.geo.centroid(china);
    var ratio = 500/960;
    
        var width = 650;
        var height = 650;
    
    var projection = d3.geo.mercator()
        .scale(width)
        .center(center)
        .translate([width/2, height/2]);
    
    var path = d3.geo.path()
        .projection(projection);
    
    var svg = d3.select("#map").append("svg")
        .attr("width", width + 400)
        .attr("height", height);
    
     var tooltip = d3.select("body")
                            .append("div")
                            .attr("class", "maptooltip");
    
    var chinadata = china.features;
    
      var pop = d3.extent(chinadata, function(d) {return +d.properties.Population});
      var res = d3.extent(chinadata, function(d) {return +d.properties.Residents});
      // setup x
      var xScale = d3.scale.linear().range([100, width - 20]).domain(pop), // value -> display
          xAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(5)
      .orient("bottom")
      .outerTickSize([0]);

      // setup y
      var yScale = d3.scale.linear().range([height-100, 60]).domain(res), // value -> display
          yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .outerTickSize([0]);;

     var x_axis_g = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height -85) + ")")
          .call(xAxis).style('opacity', 0);

      x_axis_g.append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Population");

      // y-axis
      var y_axis_g = svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(84, 0 )")
          .call(yAxis)
          .style('opacity', 0);

      y_axis_g.append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 12)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Resident Income");
    
    var g = svg.append("g");
  
    var states = g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(chinadata)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { var value = d.properties.Percent;
            return color(value); });
    
    var explode_states = g.append("g")
        .attr("id", "explode-states")
        .selectAll("path")
        .data(chinadata)
        .enter().append("path")
        .attr("d", path)
      .style("fill", function(d) { var value = d.properties.Percent;
      return color(value); });
   
     var default_size = function(d, i) { return 150; };
      var exploder = d3.geo.exploder()
                      .projection(projection)
                      .size(default_size)
                      .position(function(d,i){ return [800, height/2]});
    // Here is the magic!
    // This exploder will create a grid of the states
    // when called on a featurelist selection
    
   
    
    function addButton(text, callback) {
        d3.select("#buttons").append('button')
          .text(text)
          .classed("button", true)
          .on('click', function() {
            // clear running animation
            
            // hide axis
            x_axis_g.transition().duration(500).style('opacity', 0);
            y_axis_g.transition().duration(500).style('opacity', 0);
            // reset to default size
            exploder.size(default_size);
            callback.call(this);
          })
      }

      addButton('scatter', function(d, i) {


        // hide axis
        x_axis_g.transition().duration(500).style('opacity', 1);
        y_axis_g.transition().duration(500).style('opacity', 1);

        states.transition()
              .duration(500)
              .call(
        exploder
            .size(function(d, i) { return 50; })
            .position(function(d, i) {
                  var x = xScale(+d.properties.Population);
                  var y = yScale(+d.properties.Residents);
                  return [x, y];
                })
              );
          
          explode_states.style("display", "none");
          
          d3.select("#info").style("display", "none");

      });

      addButton('reset', function() {
          
        explode_states.style("display", null);
          
        states.transition()
              .duration(500)
              .attr("d", path)
              .attr("transform", "translate(0,0)");
        
        d3.select("#info").style("display", null);
          
          exploder.position(function(d, i) {
              return [800, height/2-30];
          });
          
           d3.selectAll('.highlighted-state')
            .transition()
            .duration(500)
            .attr("d", path)
            .attr("transform", "translate(0,0)")
            .each('end', function() {
                d3.select(this).classed('highlighted-state', false)
                
            })
            
        d3.select(this)
            .classed('highlighted-state', true)
            .transition()
            .duration(500)
            .call(exploder); 
      
});
    
        
    explode_states.on('mouseover', function(){
        console.log(d3.select(this).data()[0]);
    var data = d3.select(this).data()[0];
        
    tooltip
        .style("display", null)
        .html("<p>" + data.properties.Story + "</p>");
    });
   
   explode_states.on('mousemove', function(){
   console.log(d3.event.pageX, d3.event.pageY);
    tooltip
        .style("top", (d3.event.pageY - 5) + "px" )
        .style("left", (d3.event.pageX + 5) + "px");
   
   }); 
    
   explode_states.on('mouseout', function(){
   tooltip.style("display", "none");
   });
    
    
    explode_states.on('click', function() {
    
        var data = d3.select(this).data()[0];
        
        explode_states.style("display", null);
        
        d3.select("#info")
            .html("<p>" + "Province:"+""+ data.properties.ADM1 + "<br>Population:" + (+data.properties.Population / 1000000)+"million" +"<br>Per capita disposable income:" +"$"+ +data.properties.Residents + "</p>");
        
        d3.selectAll('.highlighted-state')
            .transition()
            .duration(500)
            .attr("d", path)
            .attr("transform", "translate(0,0)")
            .each('end', function() {
                d3.select(this).classed('highlighted-state', false)
                
            })
            
        d3.select(this)
            .classed('highlighted-state', true)
            .transition()
            .duration(500)
            .call(exploder); 
    });
   
    
}