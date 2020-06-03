jsPsych.plugins['canvas-plugin'] = (function(){

  var plugin = {};

  plugin.info = {
    name: 'canvas-plugin',
    parameters: {
      stimulus: {
		array: true,
        default: undefined,
		description: 'The stimulus parameters for Canvas.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      }
    }
  }

  plugin.trial = function(display_element, trial){
	//start a canvas container with specific height and width
	cID = 'canvas';
	cW = 300;
	cH = 300;
	html = '<canvas id="'+cID+'" height="'+cH+'" width="'+cW+'">Your browser doesn&#39;t support canvas; You cannot run this experiment</canvas>';
	// add prompt
    if(trial.prompt !== null){
	  html += '<br>';
      html += trial.prompt;
    }
	// draw
    display_element.innerHTML = html;
	
	
	// START OF CANVAS CODE
	//This is where you draw in the canvas; good luck.
	var sparams = trial.stimulus;
	var canvas = document.getElementById(cID);
	var ctx = canvas.getContext("2d");
	ctx.moveTo(0, 0);
	ctx.beginPath();
	ctx.arc(150, 150, sparams.radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fillStyle = sparams.color;
    ctx.fill();
	// END OF CANVAS CODE
	
	//The next bit of code was copied pretty much directly from jspsych-html-keyboard-response.
	//Changes were only made to the querySelector lines, in order to correctly point to our canvas id. No need to modify
    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
	  display_element.querySelector('#'+cID).className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#'+cID).style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();