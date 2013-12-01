    <script>
      require(["seconds"], 
      function(seconds) {
      var minutes = seconds.secondsToMinutes(360);
      console.log("minutes = " + minutes);
      });

