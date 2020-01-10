//initiate global variables
var recommends;
var api_session;
var api_status;
var api_topic;
var api_ods;
var api_target;
var api_workspace;
var results;
var allFiltersT = ["cbTopicAll"];
var allFiltersO = ["cbOdsAll"];
var allFiltersS = ["cbSesAll"];

window.localStorage.setItem('allFiltersT', JSON.stringify(allFiltersT));
window.localStorage.setItem('allFiltersO', JSON.stringify(allFiltersO));
window.localStorage.setItem('allFiltersS', JSON.stringify(allFiltersS));
			
//-----------------------------------------
//-----------------------------------------
//---------- asynchronous fetch -----------
//-----------------------------------------
//-----------------------------------------
// source https://dev.to/shoupn/javascript-fetch-api-and-using-asyncawait-47mp
async function fetchApis() {
	//show lightbox
	document.getElementById("light-box").style.display = 'block';

	//individual functions fetching data 
	async function fetchRecom() {
		let response = await fetch('https://sheet.best/api/sheets/e231aca3-a04d-45fa-b6fb-9313693e05a1');
		let t_api_recomend = await response.json();
		return t_api_recomend;
	}
	async function fetchStatus() {
		let response = await fetch('https://sheet.best/api/sheets/e231aca3-a04d-45fa-b6fb-9313693e05a1/tabs/Estado');
		let t_api_status = await response.json();
		return t_api_status;
	}
	async function fetchTopic() {
		let response = await fetch('https://sheet.best/api/sheets/e231aca3-a04d-45fa-b6fb-9313693e05a1/tabs/Temas');
		let t_api_topic = await response.json();
		return t_api_topic;
	}
	async function fetchOds() {
		let response = await fetch('https://sheet.best/api/sheets/e231aca3-a04d-45fa-b6fb-9313693e05a1/tabs/ODS');
		let t_api_ods = await response.json();
		return t_api_ods;
	}
	async function fetchTarget() {
		let response = await fetch('https://sheet.best/api/sheets/e231aca3-a04d-45fa-b6fb-9313693e05a1/tabs/Destinatario');
		let t_api_target = await response.json();
		return t_api_target;
	}
	async function fetchWorkspace() {
		let response = await fetch('https://sheet.best/api/sheets/e231aca3-a04d-45fa-b6fb-9313693e05a1/tabs/AreasDeTrabajo');
		let t_api_workspace = await response.json();
		return t_api_workspace;
	}
	async function fetchDnudpi() {
		let response = await fetch('https://sheet.best/api/sheets/e231aca3-a04d-45fa-b6fb-9313693e05a1/tabs/DNUDPI');
		let t_api_dnudpi = await response.json();
		return t_api_dnudpi;
	}
	async function fetchNotes() {
		let response = await fetch('https://sheet.best/api/sheets/e231aca3-a04d-45fa-b6fb-9313693e05a1/tabs/Anotaciones');
		let t_api_notes = await response.json();
		return t_api_notes;
	}
	// fetch all APIs in parallel
	let apiData = await Promise.all([
		fetchRecom(), 
		fetchStatus(), 
		fetchTopic(), 
		fetchOds(),
		fetchTarget(),
		fetchWorkspace(),
		fetchDnudpi(),
		fetchNotes() ]);
	// call the function that builds the main matrix
	var response = createMainMatrix(apiData)
	return response;
}

//-----------------------------------------
//-----------------------------------------
//---------- Create Main Matrix -----------
//-----------------------------------------
//-----------------------------------------

//this function builds the main matrix
function createMainMatrix(apiData) {
	//load variables from API
	var api_recomend = apiData[0];
	var api_session = JSON.parse("[]");
	var api_status = apiData[1];
	var api_topic = apiData[2];
	var api_ods = apiData[3];
	var api_target = apiData[4];
	var api_workspace = apiData[5];
	var api_dnudpi = apiData[6];
	var api_note = apiData[7];

	//Recommendations wrapper;
	var t_recommends = JSON.parse("[]");

	//create api_session
	var t1_api_session = JSON.parse("[]");
	//gather a list of unique years
	for (let i = 0; i < api_recomend.length; ++i) {
		t1_api_session.push(api_recomend[i].year);
	}
	var t2_api_session = [...new Set(t1_api_session)]; //create array with unique values (year)
	//pair year with session number in array
	for (let i = 0; i < t2_api_session.length; ++i) {
		let x = api_recomend.find(o => o.year === t2_api_session[i]);
		var t3_api_session = [x.year,x.session];
		api_session.push(t3_api_session); //insert array in main array
	}
	//api_session.sort( (a,b) =>  b[0] - a[0] ); // reverse order

	for (let i = 0; i < api_recomend.length; ++i) {
		function emptyNull(x) {
			if (x === null) {
				var x = "";
				return x;
			} else if (x === "null"){
				var x = ""; 
				return x;
			} else {
				return x;
			}
		}

		//MAIN TEMPORAL RECOMM OBJECT
		var t_recom = {};

		//basic data
		var t_id = api_recomend[i].id;
		var t_year = api_recomend[i].year;
		var t_session = api_recomend[i].session;
		var t_paragraph = api_recomend[i].paragraph;
		//
		t_recom.id = t_id;
		t_recom.year = t_year;
		t_recom.session = t_session;
		t_recom.paragraph = t_paragraph;

		//status
		var t_statuss = {};
		var t_status = api_recomend[i].status_id;
		let x_status = api_status.find(o => o.status_id === t_status);
		var t_status_id = x_status.status_id;
		var t_status_en = x_status.status_en;
		//
		t_statuss.status_id = emptyNull(t_status_id);
		t_statuss.status_en = emptyNull(t_status_en);
		//
		t_recom.status = t_statuss;

		//recommendation
		var t_titles = {};
		//
		var t_title_recommendation_en = api_recomend[i].title_recommendation_en;
		var t_recommendation_en = api_recomend[i].recommendation_en;
		//
		t_titles.title_recommendation_en = emptyNull(t_title_recommendation_en);
		t_titles.recommendation_en = emptyNull(t_recommendation_en);
		//
		t_recom.title = t_titles;
					
		//topic
		var t_topics = [];
		var topicArray = JSON.parse("[" + api_recomend[i].topic_id + "]");
		for (let x = 0; x < topicArray.length; ++x) {
			var t_topic = {};
			if (topicArray[x] === 0) {
				continue;
			}
			let x_topic = api_topic.find(o => parseInt(o.topic_id) === topicArray[x]);
			//
			t_topic.topic_id = emptyNull(x_topic.topic_id);
			t_topic.topic_en = emptyNull(x_topic.topic_en);
			//
			t_topics.push(t_topic);
		}
		t_recom.topic = t_topics;
					
		//ods
		var t_odss = [];
		var odsArray = JSON.parse("[" + api_recomend[i].ods_id + "]");
		for (let x = 0; x < odsArray.length; ++x) {
			var t_ods = {};
			if (odsArray[x] === 0) {
				continue;
			}
			let x_ods = api_ods.find(o => parseInt(o.ods_id) === odsArray[x]);
			//
			t_ods.ods_id = emptyNull(x_ods.ods_id);
			t_ods.ods_en = String(x_ods.ods_id)+". "+emptyNull(x_ods.ods_en);
			//
			t_odss.push(t_ods);
		}
		t_recom.ods = t_odss;
	
		//target
		var t_targets = [];
		var targetArray = JSON.parse("[" + api_recomend[i].target_id + "]");
		for (let x = 0; x < targetArray.length; ++x) {
			var t_target = {};
			if (targetArray[x] === 0) {
				continue;
			}
			let x_target = api_target.find(o => parseInt(o.target_id) === targetArray[x]);
			//
			t_target.target_id = emptyNull(x_target.target_id);
			t_target.target_en = emptyNull(x_target.target_en);
			//
			t_targets.push(t_target);
		}
		t_recom.target = t_targets;
					
		//workspace
		var t_workspaces = [];
		var workspaceArray = JSON.parse("[" + api_recomend[i].workspace_id + "]");
		for (let x = 0; x < workspaceArray.length; ++x) {
			var t_workspace = {};
			if (workspaceArray[x] === 0) {
				continue;
			}
			let x_workspace = api_workspace.find(o => parseInt(o.workspace_id) === workspaceArray[x]);
			//
			t_workspace.workspace_id = emptyNull(x_workspace.workspace_id);
			t_workspace.workspace_en = emptyNull(x_workspace.workspace_en);
			//
			t_workspaces.push(t_workspace);
		}
		t_recom.workspace = t_workspaces;
	
		//dnudpi
		var t_dnudpis = [];
		var dnudpiArray = JSON.parse("[" + api_recomend[i].dnudpi_id + "]");
		for (let x = 0; x < dnudpiArray.length; ++x) {
			var t_dnudpi = {};
			if (dnudpiArray[x] === 0) {
				//t_dnudpis.push(t_dnudpi);
				continue;
			}
			let x_dnudpi = api_dnudpi.find(o => parseInt(o.dnudpi_id) === dnudpiArray[x]);
			//
			t_dnudpi.dnudpi_detail_en = emptyNull(x_dnudpi.dnudpi_detail_en);	
			//				
			t_dnudpis.push(t_dnudpi);
		}
		t_recom.dnudpi = t_dnudpis;

		//notes
		var t_notes = [];
		for (let x = 0; x < api_note.length; ++x) {
			var t_note = {};
			var recomArray = JSON.parse("[" + api_note[x].id_recommendation + "]");
			for (let y = 0; y < recomArray.length; ++y) {
				if (recomArray[y] === parseInt(api_recomend[i].id)) {
					//
					t_note.note_en = api_note[x].note_en;
					t_note.source_en = api_note[x].source_en;
					t_note.from_en = api_note[x].from_en;
					t_note.type_en = api_note[x].type_en;
					t_note.scope_en = api_note[x].scope_en;
					t_note.year = api_note[x].year;
					t_note.link = api_note[x].link;
					//
					t_notes.push(t_note);
				}
			}
		}
		t_recom.notes = emptyNull(t_notes);
		//
		t_recommends.push(t_recom);
	}
	var t_recommends = [t_recommends,api_status,api_topic,api_ods,api_target,api_workspace,api_session];
	return t_recommends;
}

//-----------------------------------------
//-----------------------------------------
//------------ Results page ---------------
//-----------------------------------------
//-----------------------------------------

// search using Fuse
function searchRecom() {
	// store keyword in localSession
	window.localStorage.setItem('kw', keyWord);
	// Fuse options				
	var options = {
		shouldSort: true,
		tokenize: true,
		threshold: 0.2,
		location: 0,
		distance: 100,
		includeScore: true,
		maxPatternLength: 32,
		minMatchCharLength: 2,
		keys: ["title.recommendation_en",
			   "title.title_recommendation_en",
			   "topic.topic_en"]
	};
	//Fuse search
	var fuse = new Fuse(recommends, options); //https://fusejs.io/
	const results = fuse.search(keyWord);
	return results;
}

function resultsCaller() {
	//insert keyword in search box
	document.getElementById("titlResult").innerHTML += keyWord+"'"; 
	//hide empty state results - hide reset filter
	document.getElementById("empty-state").style.display = 'none';
	document.getElementById("focusButton").style.display = 'block';
	//Magic :)
	showResults();
	showFilters();
	// hide lightbox and show content
	//document.getElementById("filters").style.display = 'block';
	document.getElementById("div-results").style.display = 'block';
	document.getElementById("focusButton").style.display = 'block';
	document.getElementById("light-box").style.display = 'none';
}

//funtion to show the results page, turning JSON into object
function showResults() {	
	//prepare DOM to show results									
	document.getElementById("empty-state").style.display = 'none';
	document.getElementById("titlResult").style.display = 'block';
	document.getElementById("numFoundTit").style.display = 'block';
	document.getElementById("focusButton").style.display = 'block';
					
	//load arrays from localStorage and from API
	//var filters = allFiltersT;
	var filtersT = JSON.parse(window.localStorage.getItem('allFiltersT'));
	var filtersO = JSON.parse(window.localStorage.getItem('allFiltersO'));
	var filtersS = JSON.parse(window.localStorage.getItem('allFiltersS'));
					
	// generate different HTML elements to create the results list
	// iterative building of each result box
	var resultDiv = document.getElementById("resultList"); //define main results wrapper

	pageTitle.innerHTML += "'"+keyWord+"'"; //create title

	//count results
	var resultsNum = 0;

	// CREATE RESULT ITEMS
	for (var i = 0; i < results.length; i++) { //iterate results array

		//Verify existing filters and skip loop if filter is present in result item
		//This component filters results vs checkboxes
		if (filtersT[0] != "cbTopicAll") {
			for (let y = 0; y < filtersT.length; ++y) {
				var filterTopic = filtersT[y].match(/(\d+)/); //extract the number
				var topicX = results[i].item.topic;
				for (let x = 0; x < topicX.length; ++x) {
					var found = 0;
					if (topicX[x].topic_id === filterTopic[0]) {
						var found = 1;
						break;
					}
				}
				if (found === 0) {
					break;
				}
			}
			if (found === 0) {
				continue;
			}
		}
		
		//Verify existing filters and skip loop if filter is present in result item
		//This component filters results vs checkboxes
		if (filtersO[0] != "cbOdsAll") {
			for (let y = 0; y < filtersO.length; ++y) {
				var filterOds = filtersO[y].match(/(\d+)/); //extract the number
				var odsX = results[i].item.ods;
				for (let x = 0; x < odsX.length; ++x) {
					var found = 0;
					if (odsX[x].ods_id === filterOds[0]) {
						var found = 1;
						break;
					}
				}
				if (found === 0) {
					break;
				}
			}
			if (found === 0) {
				continue;
			}
		}
		
		//Verify existing filters and skip loop if filter is present in result item
		//This component filters results vs checkboxes
		if (filtersS[0] != "cbSesAll") {
			for (let y = 0; y < filtersS.length; ++y) {
				var filterSes = filtersS[y].match(/(\d+)/); //extract the number
				var sesX = results[i].item.session;
				var found = 0;
				if (sesX === filterSes[0]) {
					var found = 1;
				}
				if (found === 0) {
					break;
				}
			}
			if (found === 0) {
				continue;
			}
		}
							
		// Create HTML result box elements
		var recomWrap = document.createElement("div");
		var recomSession = document.createElement("span");
		var recomDesc1 = document.createElement("p"); //description part 1
		var recomDesc2 = document.createElement("span"); //description part 2
		var recomDescLink = document.createElement("a");
		var recomH3SubtTop = document.createElement("h3");
		var recomWrapTopic = document.createElement("div");
		var recomH3SubtODS = document.createElement("h3");
		var recomWrapODS = document.createElement("div");
		var recomTit = document.createElement("h2"); //create h2 title
		var recomTitLink = document.createElement('a'); //create link (a) title
		
		// Define values before inserting into box elements
		// vRecomDesc pulls the recomendation from the results array (Fuse)
		// topicArray is an array created from the topic_ids, turning a string into an 
		// array the separated by comma [1,2,3]
		// vRecomDesc1 & vRecomDesc2 is recomm description in 2 parts to create later 
		// the "view more" link
		// odsArray, the same as topicArray
		var vRecomTit = "Recommendation "+results[i].item.session+"."+results[i].item.paragraph+": "+results[i].item.title.title_recommendation_en+" »"; 
		var vRecomSession = "Session #"+results[i].item.session+" ("+results[i].item.year+")";
		var vRecomDesc = results[i].item.title.recommendation_en;
		var vRecomDesc1 = vRecomDesc.slice(0, 370); //part 1 description of 370 chars
		var vRecomDesc2 = vRecomDesc.slice(370, 5000); // part 2
		var vRecomH3SubtTop = "Topic";
		var vRecomH3SubtODS = "SDG";
		
		// Build Recommendation link to detail page
		// Here is when the individual recommendation link is created
		recomTit.innerHTML = vRecomTit; //insert text in h2
		recomTitLink.setAttribute("class", "recom-title"); //add class to link (a)
		recomTitLink.appendChild(recomTit); // insert h2 in link (a)
		recomTitLink.href = "recomm_detail-en.htm?rcm="+results[i].item.id; //insert href in (a)
													
		// Insert values in HTML elements
		recomSession.innerHTML = vRecomSession; //insert session in span
		recomH3SubtTop.innerHTML = vRecomH3SubtTop; // insert Topic subtitle in h3 
		recomH3SubtODS.innerHTML = vRecomH3SubtODS; // insert ODS subtitle in h3
		recomDesc1.innerHTML = vRecomDesc1; // insert description part1 (p)
		recomDesc2.innerHTML = vRecomDesc2; // insert description part2 (span)
							
		// Build link of session
		var sessionLink = document.createElement('a'); //create link (a) session
		sessionLink.setAttribute("class", "miniButton"); //add class to span
		sessionLink.appendChild(recomSession); // insert span in link
		sessionLink.href = "cluster-en.htm?type=session&id="+results[i].item.year;
		//insert href in topic link
	
		// Build recommendation description with link "view more"
		// Verify if description usses the part 2, otherwise don't insert link "view more"
		javascriptText = "document.getElementById('descrip"+i+"').style.display = 'inline';document.getElementById('vermas"+i+"').style.display = 'none'"; // build javascript to insert in a
		recomDescLink.href = "javascript:void(0);"; //insert href into a with JS to avoid scroll
		recomDescLink.setAttribute("onclick", javascriptText); //insert onclick into a
		recomDescLink.innerHTML = "(..view more)"; // insert text in link
		recomDescLink.setAttribute("id", "vermas"+i); //add id to link
		recomDesc1.appendChild(recomDesc2); // insert span in p (description)
		if (vRecomDesc2 != "") { //verify if description part 2 is not empty
			recomDesc1.appendChild(recomDescLink); // then insert a in p
		}
		recomDesc2.setAttribute("style", "display:none"); //add hidden style
		recomDesc2.setAttribute("id", "descrip"+i); //add hidden style
							
		// Build topics list
		// Iterates topics *1*
		// Creates individual links
		if (results[i].item.topic.length != 0) { // if topics is empty
			for (let x = 0; x < results[i].item.topic.length; ++x) { // loop - number of topics
				var recomTopic = document.createElement("span"); //create span
				var topicLink = document.createElement('a'); //create link (a) topics
				//find and pick a topic regarding the topic_id
				recomTopic.innerHTML = results[i].item.topic[x].topic_en; //insert topic in span
				topicLink.setAttribute("class", "miniButton"); //add class to span
				topicLink.appendChild(recomTopic); // insert span into link
				topicLink.href = "cluster-en.htm?type=topic&id="+results[i].item.topic[x].topic_id;
				//insert href into topic link
				recomWrapTopic.appendChild(topicLink); //append span in div wrapper
			}
		}
		
		// Build ODS list
		// Iterates ods *2*
		// Creates individual links
		// Create individual classes for color purposes
		if (results[i].item.ods.length != 0) { // if ods is empty
			for (let x = 0; x < (results[i].item.ods).length; ++x) { // loop -number of ods
				var recomODS = document.createElement("span");
				var odsLink = document.createElement('a'); //create link (a) odss
				//find and pick a ods in the loop
				recomODS.innerHTML = results[i].item.ods[x].ods_en; //insert ods in span
				// put color on ODS
				var n_id = results[i].item.ods[x].ods_id;
				if (n_id === "1") {
					odsLink.setAttribute("class", "miniButton color-ods-1"); //add class
				} else if (n_id === "2") {
					odsLink.setAttribute("class", "miniButton color-ods-2");
				} else if (n_id === "3") {
					odsLink.setAttribute("class", "miniButton color-ods-3");
				} else if (n_id === "4") {
					odsLink.setAttribute("class", "miniButton color-ods-4");
				} else if (n_id === "5") {
					odsLink.setAttribute("class", "miniButton color-ods-5");
				} else if (n_id === "6") {
					odsLink.setAttribute("class", "miniButton color-ods-6");
				} else if (n_id === "7") {
					odsLink.setAttribute("class", "miniButton color-ods-7");
				} else if (n_id === "8") {
					odsLink.setAttribute("class", "miniButton color-ods-8");
				} else if (n_id === "9") {
					odsLink.setAttribute("class", "miniButton color-ods-9");
				} else if (n_id === "10") {
					odsLink.setAttribute("class", "miniButton color-ods-10");
				} else if (n_id === "11") {
					odsLink.setAttribute("class", "miniButton color-ods-11");
				} else if (n_id === "12") {
					odsLink.setAttribute("class", "miniButton color-ods-12");
				} else if (n_id === "13") {
					odsLink.setAttribute("class", "miniButton color-ods-13");
				} else if (n_id === "14") {
					odsLink.setAttribute("class", "miniButton color-ods-14");
				} else if (n_id === "15") {
					odsLink.setAttribute("class", "miniButton color-ods-15");
				} else if (n_id === "16") {
					odsLink.setAttribute("class", "miniButton color-ods-16");
				} else {
					odsLink.setAttribute("class", "miniButton color-ods-17");
				}
				odsLink.appendChild(recomODS); // insert span in link
				odsLink.href = "cluster-en.htm?type=ods&id="+n_id; //insert href in ods link
				recomWrapODS.appendChild(odsLink); //append span in div wrapper
			}
		}
		// Build individual recommendation boxes
		recomWrap.setAttribute("class", "recomWrap");
		resultDiv.appendChild(recomWrap);
		recomWrap.appendChild(recomTitLink);
		recomWrap.appendChild(sessionLink);
		recomWrap.appendChild(recomDesc1);
		if (results[i].item.topic.length != 0) {
			recomWrap.appendChild(recomH3SubtTop);
			recomWrap.appendChild(recomWrapTopic);
		}
		if (results[i].item.ods.length != 0) {
			recomWrap.appendChild(recomH3SubtODS);
			recomWrap.appendChild(recomWrapODS);
		}
		//calc number of results
		var resultsNum = resultsNum + 1;
	}

	//insert number of results
	document.getElementById("numFound").innerHTML = resultsNum;
	//if results is empty
	if (resultsNum === 0) {
		document.getElementById("empty-state").style.display = 'block';
		document.getElementById("titlResult").style.display = 'none';
		document.getElementById("numFoundTit").style.display = 'none';
		document.getElementById("focusButton").style.display = 'none';
	}
}

function showFilters() {	
	// find the topics not involved in the results
	var disabTopic = [];
	for (let i = 0; i < api_topic.length; ++i) {
		var found = 0;
		for (let e = 0; e < results.length; ++e) {
			for (let u = 0; u < results[e].item.topic.length; ++u) {
				if (results[e].item.topic[u].topic_id === api_topic[i].topic_id) {
					var found = 1;
					break;
				}
			}
			if (found === 1) {
				continue;
			}
		}
		if (found === 0) {
			if (api_topic[i].topic_id != "0") {
				disabTopic.push(api_topic[i].topic_id);
			}
		}
	}
	
	// find the ODS not involved in the results
	var disabOds = [];
	for (let i = 0; i < api_ods.length; ++i) {
		var found = 0;
		for (let e = 0; e < results.length; ++e) {
			for (let u = 0; u < results[e].item.ods.length; ++u) {
				if (results[e].item.ods[u].ods_id === api_ods[i].ods_id) {
					var found = 1;
					break;
				}
			}
			if (found === 1) {
				continue;
			}
		}
		if (found === 0) {
			if (api_ods[i].ods_id != "0") {
				disabOds.push(api_ods[i].ods_id);
			}
		}
	}
	
	// find the Sessions not involved in the results
	var disabSes = [];
	for (let i = 0; i < api_session.length; ++i) {
		var found = 0;
		for (let e = 0; e < results.length; ++e) {
			if (results[e].item.year === api_session[i][0]) {
				var found = 1;
				break;
			}
			if (found === 1) {
				continue;
			}
		}
		if (found === 0) {
			disabSes.push(api_session[i][0]);
		}
	}
						
	// Build all filters of Topics
	// But they are not shown yet
	// iterates the topic array (api_topic) to build the 
	document.getElementById("topicParentF").innerHTML += "("+(api_topic.length-1)+")"; 
	//insert # topics in title
	for (let i = 0; i < api_topic.length; ++i) { // loop - number of topics
		if (api_topic[i].topic_id === "0") { //exclude "none" topic
			continue;
		}
		var filtLi = document.createElement("li"); // individual filter
		var spanCb = document.createElement("span"); //span checkbox
		var spanFc = document.createElement("span"); //span facet
		var inputCb = document.createElement("input"); //input checkbox
		var labelFc = document.createElement("label"); //label facet
		//hide filters from 6 to above
		if (i >= 5) { //stamp id to li > 5, to hide them with showFiltersTop()
			filtLi.setAttribute("id", "liTopic"+(i+1));;
			filtLi.setAttribute("style", "display:none");;
		}						
		spanFc.setAttribute("class", "facet-title"); //add class to span/label
		inputCb.setAttribute("type", "checkbox");//add type to input
		inputCb.setAttribute("id", "cbTopic"+(i+1)); //add id to input
		inputCb.setAttribute("name", "cbTopic"+(i+1)); //add name to input
		inputCb.setAttribute("value", "cbTopic"+(i+1)); //add value to input
		inputCb.setAttribute("onchange", "runFilterT('cbTopic"+(i+1)+"',"+api_topic.length+");"); //add value to input
		labelFc.innerHTML = api_topic[i].topic_en; //insert topic in label
		labelFc.setAttribute("for", "cbTopic"+(i+1)); //add for to input
		spanCb.appendChild(inputCb); //insert checkbox in span
		spanFc.appendChild(labelFc); //insert label in span
		filtLi.appendChild(spanCb); //insert span.checkbox in li
		filtLi.appendChild(spanFc); //insert span.label in li
		filtTopics.appendChild(filtLi); // insert li in ul
		//disable if is not present in the results
		if (disabTopic.includes(api_topic[i].topic_id) === true) {
			document.getElementById("cbTopic"+(i+1)).disabled = true;
			labelFc.setAttribute("class", "disable-checkbox");
		}
	}
	
	// Build all filters of ODS
	// But they are not shown yet
	// iterates the topic array (api_ods) to build the 
	document.getElementById("odsParentF").innerHTML += "("+(api_ods.length-1)+")"; 
	//insert # ods in title
	for (let i = 0; i < api_ods.length; ++i) { // loop - number of ods
		if (api_ods[i].ods_id === "0") { //exclude "none" ods
			continue;
		}
		var filtLi = document.createElement("li"); // individual filter
		var spanCb = document.createElement("span"); //span checkbox
		var spanFc = document.createElement("span"); //span facet
		var inputCb = document.createElement("input"); //input checkbox
		var labelFc = document.createElement("label"); //label facet
		//hide filters from 6 to above
		if (i >= 5) { //stamp id to li > 5, to hide them with showFiltersTop()
			filtLi.setAttribute("id", "liOds"+(i+1));;
			filtLi.setAttribute("style", "display:none");;
		}						
		spanFc.setAttribute("class", "facet-title"); //add class to span/label
		inputCb.setAttribute("type", "checkbox");//add type to input
		inputCb.setAttribute("id", "cbOds"+(i+1)); //add id to input
		inputCb.setAttribute("name", "cbOds"+(i+1)); //add name to input
		inputCb.setAttribute("value", "cbOds"+(i+1)); //add value to input
		inputCb.setAttribute("onchange", "runFilterO('cbOds"+(i+1)+"');"); //add value to input
		labelFc.innerHTML = api_ods[i].ods_en; //insert ods in label
		labelFc.setAttribute("for", "cbOds"+(i+1)); //add for to input
		spanCb.appendChild(inputCb); //insert checkbox in span
		spanFc.appendChild(labelFc); //insert label in span
		filtLi.appendChild(spanCb); //insert span.checkbox in li
		filtLi.appendChild(spanFc); //insert span.label in li
		filtOds.appendChild(filtLi); // insert li in ul
		//disable if is not present in the results
		if (disabOds.includes(api_ods[i].ods_id) === true) {
			document.getElementById("cbOds"+(i+1)).disabled = true;
			labelFc.setAttribute("class", "disable-checkbox");
		}
	}
	
	// Build all filters of Sessions
	// But they are not shown yet
	// iterates the topic array (api_sessions) to build the 
	document.getElementById("sesParentF").innerHTML += "("+(api_session.length)+")"; 
	//insert # ods in title
	for (var i = api_session.length - 1; i >= 0; i--) { // loop - number of sessions
		var filtLi = document.createElement("li"); // individual filter
		var spanCb = document.createElement("span"); //span checkbox
		var spanFc = document.createElement("span"); //span facet
		var inputCb = document.createElement("input"); //input checkbox
		var labelFc = document.createElement("label"); //label facet
		//hide filters from 6 to above
		var sesNum = api_session.length - 6;
		if (i <= sesNum) { //stamp id to li > 5, to hide them with showFiltersTop()
			filtLi.setAttribute("id", "liSes"+(i+1));;
			filtLi.setAttribute("style", "display:none");;
		}						
		spanFc.setAttribute("class", "facet-title"); //add class to span/label
		inputCb.setAttribute("type", "radio");//add type to input
		inputCb.setAttribute("id", "cbSes"+(i+1)); //add id to input
		inputCb.setAttribute("name", "cbSes"+(i+1)); //add name to input
		inputCb.setAttribute("value", "cbSes"+(i+1)); //add value to input
		inputCb.setAttribute("onchange", "runFilterS('cbSes"+(i+1)+"');"); //add value to input
		labelFc.innerHTML = "Session #"+api_session[i][1]+" ("+api_session[i][0]+")"; //insert session in label
		labelFc.setAttribute("for", "cbSes"+(i+1)); //add for to input
		spanCb.appendChild(inputCb); //insert checkbox in span
		spanFc.appendChild(labelFc); //insert label in span
		filtLi.appendChild(spanCb); //insert span.checkbox in li
		filtLi.appendChild(spanFc); //insert span.label in li
		filtSes.appendChild(filtLi); // insert li in ul
		//disable if is not present in the results
		if (disabSes.includes(api_session[i][0]) === true) {
			document.getElementById("cbSes"+(i+1)).disabled = true;
			labelFc.setAttribute("class", "disable-checkbox");
		}
	}
	
	// create link "ver más" after the first 5 filters
	var wrapVermas = document.createElement("li");
	wrapVermas.setAttribute("class", "f_vermas"); //add class to li
	var filTopVermas = document.createElement("a");
	filTopVermas.innerHTML = "View more..."; // insert text in link
	filTopVermas.href = "javascript:void(0);"; //insert href into link in JS to avoid scroll
	filTopVermas.setAttribute("onclick", "showFiltersTop1("+api_topic.length+")"); //insert onclick into a
	filTopVermas.setAttribute("id", "f_vermas1"); //add id to link
	wrapVermas.appendChild(filTopVermas); // insert span in p (description)
	filtTopics.appendChild(wrapVermas); // insert span in p (description)
	
	// create link "ver más" after the first 5 filters
	var wrapVermas = document.createElement("li");
	wrapVermas.setAttribute("class", "f_vermas"); //add class to li
	var filTopVermas = document.createElement("a");
	filTopVermas.innerHTML = "View more..."; // insert text in link
	filTopVermas.href = "javascript:void(0);"; //insert href into link in JS to avoid scroll
	filTopVermas.setAttribute("onclick", "showFiltersTop2("+api_ods.length+")"); //insert onclick into a
	filTopVermas.setAttribute("id", "f_vermas2"); //add id to link
	wrapVermas.appendChild(filTopVermas); // insert span in p (description)
	filtOds.appendChild(wrapVermas); // insert span in p (description)
	
	// create link "ver más" after the first 5 filters
	var wrapVermas = document.createElement("li");
	wrapVermas.setAttribute("class", "f_vermas"); //add class to li
	var filTopVermas = document.createElement("a");
	filTopVermas.innerHTML = "View more..."; // insert text in link
	filTopVermas.href = "javascript:void(0);"; //insert href into link in JS to avoid scroll
	filTopVermas.setAttribute("onclick", "showFiltersTop3("+api_session.length+")"); //insert onclick into a
	filTopVermas.setAttribute("id", "f_vermas3"); //add id to link
	wrapVermas.appendChild(filTopVermas); // insert span in p (description)
	filtSes.appendChild(wrapVermas); // insert span in p (description)		
}

//show remaining filters, from 6 on
//loads api_topic from localStorage
//iterates the topics list from 6 
//hides the link finally
function showFiltersTop1(topicLenght) {
	for (var i=6; i<parseInt(topicLenght);i++) {
		var li = "liTopic"+(i);
		document.getElementById(li).style.display = 'block';
		document.getElementById('f_vermas1').style.display = 'none';
	}
}

//show remaining filters, from 6 on
//loads api_topic from localStorage
//iterates the ods list from 6 
//hides the link finally
function showFiltersTop2(odsLenght) {
	for (var i=6; i<parseInt(odsLenght);i++) {
		var li = "liOds"+(i);
		document.getElementById(li).style.display = 'block';
		document.getElementById('f_vermas2').style.display = 'none';
	}
}

//show remaining filters, from 6 on
//loads api_topic from localStorage
//iterates the sessions list from 6 
//hides the link finally
function showFiltersTop3(sessionLenght) {
	for (var i = api_session.length - 5; i >= 1; i--) {
		var li = "liSes"+(i);
		document.getElementById(li).style.display = 'block';
		document.getElementById('f_vermas3').style.display = 'none';
	}
}

//observer function
//this function runs when the checkbox is checked
//1. loads arrays from localStorage
//2. define a function (checkEmptyCb) for verifying if regular checkboxes are unchecked
//   observing each checkbox, and return true/false
function runFilterT(a) {
	var filters = JSON.parse(window.localStorage.getItem('allFiltersT'));									
									
	//this function is to remove checks from checkboxes
	function checkEmptyCb(x) {
		var x = true;
		for (var i=1; i< api_topic.length;i++) {
			if (document.getElementById("cbTopic"+i).checked === true) {
				var x = false;
				return x;
			}
		}
		return x;
	}

	// observe checkbox in 4 states, this is the main checkbox behavior
	// 1. All-Topics filter is checked, then no others must be unchecked
	// 2. Block All-topics to be unchecked, never
	// 3. other filter is checked, then All-Topics filter can be unchecked
	// 4. return All-Topics filters to checked if other filters are unchecked
					
	// if All-Topics filter is checked, then no others must be unchecked
	if (a === "cbTopicAll") {
		for (var i=0; i< (api_topic.length-1);i++) {
			//uncheck non All topic if All-topics is checked
			document.getElementById("cbTopic"+(i+1)).checked = false;
		}
		var filters = ["cbTopicAll"]; //initialize filters variable
		// block checkbox of All-topics if it is the only checked
		if (document.getElementById("cbTopicAll").checked === false) { 
			document.getElementById("cbTopicAll").checked = true; 
		}
		window.localStorage.setItem('allFiltersT', JSON.stringify(filters));
		var filters = JSON.parse(window.localStorage.getItem('allFiltersT'));
		document.getElementById("light-box").style.display = 'block';
		setTimeout(showLightbox, 1000);
		recomFound.setAttribute("class", "");

		// if other filters are checked
	} else {
		//ADD FILTER
		//uncheck All-topics if other filter is checked
		//and add filter to filters if checked
		document.getElementById("cbTopicAll").checked = false;
		//remove a in case the filter is already in filters
		for (var i = 0; i < filters.length; i++) {
			if (filters[i] === a) {
				filters.splice(i, 1);
			}
		}
		filters.push(a);
		//remove "cbTopicAll" from filters
		for (var i = 0; i < filters.length; i++) { 
			if (filters[i] === "cbTopicAll") {
				filters.splice(i, 1);
			}
		}

		//remove from 'filters' if checkbox is unchecked
		if (document.getElementById(a).checked === false) {
			var filters = JSON.parse(window.localStorage.getItem('allFiltersT'));
			for (var i = 0; i < filters.length; i++) {
				if (filters[i] === a) {
					filters.splice(i, 1);
				}
			}
		}
		//remove checkbox and restore All-topic if none check present
		if (checkEmptyCb() === true) {  
			// observe if other filters are unchecked, then check All-topics
			document.getElementById("cbTopicAll").checked = true;
			var filters = ["cbTopicAll"];
		}
		window.localStorage.setItem('allFiltersT', JSON.stringify(filters));
		var filters = JSON.parse(window.localStorage.getItem('allFiltersT'));
		document.getElementById("light-box").style.display = 'block';
		setTimeout(showLightbox, 1000);
		recomFound.setAttribute("class", "");
	}
}

//observer function
//this function runs when the checkbox is checked
//1. loads arrays from localStorage
//2. define a function (checkEmptyCb) for verifying if regular checkboxes are unchecked
//   observing each checkbox, and return true/false
function runFilterO(a) {
	var filters = JSON.parse(window.localStorage.getItem('allFiltersO'));									
									
	//this function is to remove checks from checkboxes
	function checkEmptyCb(x) {
		var x = true;
		for (var i=1; i< api_ods.length;i++) {
			if (document.getElementById("cbOds"+i).checked === true) {
				var x = false;
				return x;
			}
		}
		return x;
	}

	// observe checkbox in 4 states, this is the main checkbox behavior
	// 1. All-Topics filter is checked, then no others must be unchecked
	// 2. Block All-topics to be unchecked, never
	// 3. other filter is checked, then All-Topics filter can be unchecked
	// 4. return All-Topics filters to checked if other filters are unchecked
					
	// if All-Topics filter is checked, then no others must be unchecked
	if (a === "cbOdsAll") {
		for (var i=0; i< (api_ods.length-1);i++) {
			//uncheck non All topic if All-topics is checked
			document.getElementById("cbOds"+(i+1)).checked = false;
		}
		var filters = ["cbOdsAll"]; //initialize filters variable
		// block checkbox of All-topics if it is the only checked
		if (document.getElementById("cbOdsAll").checked === false) { 
			document.getElementById("cbOdsAll").checked = true; 
		}
		window.localStorage.setItem('allFiltersO', JSON.stringify(filters));
		var filters = JSON.parse(window.localStorage.getItem('allFiltersO'));
		document.getElementById("light-box").style.display = 'block';
		setTimeout(showLightbox, 1000);
		recomFound.setAttribute("class", "");

	// if other filters are checked
	} else {
		//ADD FILTER
		//uncheck All-topics if other filter is checked
		//and add filter to filters if checked
		document.getElementById("cbOdsAll").checked = false;
		//remove a in case the filter is already in filters
		for (var i = 0; i < filters.length; i++) {
			if (filters[i] === a) {
				filters.splice(i, 1);
			}
		}
		filters.push(a);
		//remove "cbTopicAll" from filters
		for (var i = 0; i < filters.length; i++) { 
			if (filters[i] === "cbOdsAll") {
				filters.splice(i, 1);
			}
		}

		//remove from 'filters' if checkbox is unchecked
		if (document.getElementById(a).checked === false) {
			var filters = JSON.parse(window.localStorage.getItem('allFiltersO'));
			for (var i = 0; i < filters.length; i++) {
				if (filters[i] === a) {
					filters.splice(i, 1);
				}
			}
		}
		//remove checkbox and restore All-topic if none check present
		if (checkEmptyCb() === true) { 
			// observe if other filters are unchecked, then check All-topics
			document.getElementById("cbOdsAll").checked = true;
			var filters = ["cbOdsAll"];
		}
		window.localStorage.setItem('allFiltersO', JSON.stringify(filters));
		var filters = JSON.parse(window.localStorage.getItem('allFiltersO'));
		document.getElementById("light-box").style.display = 'block';
		setTimeout(showLightbox, 1000);
		recomFound.setAttribute("class", "");
	}
}

//observer function
//this function runs when the checkbox is checked
//1. loads arrays from localStorage
//2. define a function (checkEmptyCb) for verifying if regular checkboxes are unchecked
//   observing each checkbox, and return true/false
function runFilterS(a) {
	var filters = JSON.parse(window.localStorage.getItem('allFiltersS'));

	// observe checkbox in 4 states, this is the main checkbox behavior
	// 1. All-Topics filter is checked, then no others must be unchecked
	// 2. Block All-topics to be unchecked, never
	// 3. other filter is checked, then All-Topics filter can be unchecked
	// 4. return All-Topics filters to checked if other filters are unchecked
	// if All-Topics filter is checked, then no others must be unchecked
	if (a === "cbSesAll") {
		for (var i=0; i< (api_session.length);i++) {
			//uncheck non All topic if All-topics is checked
			document.getElementById("cbSes"+(i+1)).checked = false;
		}
		var filters = ["cbSesAll"]; //initialize filters variable
		// block checkbox of All-topics if it is the only checked
		if (document.getElementById("cbSesAll").checked === false) { 
			document.getElementById("cbSesAll").checked = true; 
		}
		window.localStorage.setItem('allFiltersS', JSON.stringify(filters));
		var filters = JSON.parse(window.localStorage.getItem('allFiltersS'));
		document.getElementById("light-box").style.display = 'block';
		setTimeout(showLightbox, 1000);
		recomFound.setAttribute("class", "");

	// if other filters is checked
	} else {
		document.getElementById("cbSesAll").checked = false;
		//uncheck other filters
		
		document.getElementById(filters[0]).checked = false;

		var filters = []; //initialize filters variable
		filters.push(a);
		//document.getElementById(a).checked === true;
		window.localStorage.setItem('allFiltersS', JSON.stringify(filters));
		var filters = JSON.parse(window.localStorage.getItem('allFiltersS'));
		document.getElementById("light-box").style.display = 'block';
		setTimeout(showLightbox, 1000);
		recomFound.setAttribute("class", "");
	}
}

//show lightbox
function showLightbox() {
	document.getElementById("resultList").innerHTML = ""; // clear results div
	window.scrollTo(1,1);
	showResults();
	//document.getElementById("withFilt").style.display = 'inline';
	document.getElementById("light-box").style.display = 'none';
	recomFound.setAttribute("class", "new-item");
}
				
function intoMSword(){
	var numFound = parseInt(document.getElementById("numFound").innerHTML);
	//open description and hide vermas
	for (var i = 0; i < numFound; i++) {
		var descrip = "descrip"+i;
		var vermas = "vermas"+i;
		var element1 = !!document.getElementById(descrip); //verify if DOM exist
		var element2 = !!document.getElementById(vermas); //verify if DOM exist
		if (element1 && element2) { //verify if DOM exist
			document.getElementById(descrip).style.display = 'inline';
			document.getElementById(vermas).style.display = 'none';
		}
	}
	var kw = window.localStorage.getItem('keyWordSearch'); //load keyword from localStorage
	var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
			     "xmlns:w='urn:schemas-microsoft-com:office:word' "+
			     "xmlns='http://www.w3.org/TR/REC-html40'>"+
			     "<head><meta charset='utf-8'><title>Recommendation(s) with keyword '"+kw+"' of the Permanent Forum on Indigenous Issues  (UNPFII)</title></head><body>";
	var footer = "</body></html>";
	var sourceHTML = header+document.getElementById("div-results").innerHTML+footer;		       
	var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
	var fileDownload = document.createElement("a");
	document.body.appendChild(fileDownload);
	fileDownload.href = source;
	fileDownload.download = 'Recom UNPFII '+kw+'.doc';
	fileDownload.click();
	document.body.removeChild(fileDownload);
}

function orderResults() {
	var order = document.getElementById('orderSelect').value;
	if (order === "relev") {
		var results = results_relev.sort( (a,b) =>  a.score - b.score ); // relev
	} else if (order === "desc") {
		var results = results_relev.sort( (a,b) =>  parseInt(b.item.year) - parseInt(a.item.year) );
	} else if (order === "asc") {
		var results = results_relev.sort( (a,b) =>  parseInt(a.item.year) - parseInt(b.item.year) );
	}
	//document.getElementById("resultList").innerHTML = ""; //clear result list container
	document.getElementById("light-box").style.display = 'block';
	setTimeout(showLightbox, 1000);
	document.getElementById("keyWord").focus();
	document.getElementById("keyWord").blur();
}

//-----------------------------------------
//-----------------------------------------
//------- Recomendation detail page -------
//-----------------------------------------
//-----------------------------------------

function recomDetail() {
	document.getElementById("light-box").style.display = 'none';

	var contentRcm = document.getElementById("content-rcm"); //define main results wrapper

	// get recommendation number from url
	var rcm0 = new URLSearchParams(location.search);
	var rcm0 = rcm0.get('rcm');
	// find rcm in api_recomend
	let rcm = recommends.find(o => o.id === rcm0);

	//console.log(rcm);
	
	pageTitle.innerHTML = "Recommendation "+rcm.session+"."+rcm.paragraph+" "+rcm.title.title_recommendation_en+" ("+rcm.year+")"+" of the Permanent Forum on Indigenous Issues (UNPFII) | Yanapaq"; //create title

	// Create HTML result box elements
	var recomTit = document.createElement("h1"); //create h1 title
	var recomSubTit = document.createElement("h2");
	var recomWrap = document.createElement("div");
	var recomSession = document.createElement("span");
	var recomStatus = document.createElement("span");
	var recomDesc = document.createElement("p");
	var recomH3SubtTop = document.createElement("h3");
	var recomWrapTopic = document.createElement("div");
	var recomH3SubtODS = document.createElement("h3");
	var recomWrapODS = document.createElement("div");
	var recomH3SubtTarg = document.createElement("h3");
	var recomWrapTarg = document.createElement("div");
	var recomH3SubtWrkSp = document.createElement("h3");
	var recomWrapWrkSp = document.createElement("div");
	var recomH3SubtDnudpi = document.createElement("h3");
	var recomWrapDnudpi = document.createElement("div");
	var recomH3SubtNotes = document.createElement("h3");
	var recomPintroNotes = document.createElement("p");
	var recomWrapNotes = document.createElement("div");
							
	// Define values before inserting into box elements
	// vRecomDesc pulls the recomendation from the results array (Fuse)
	// topicArray is an array created from the topic_ids, turning a string into an 
	// array the separated by comma [1,2,3]
	// odsArray, the same as topicArray
	var vRecomTit = "Recommendation "+rcm.session+"."+rcm.paragraph+": "+rcm.title.title_recommendation_en;
	var vRecomSession = "Session #"+rcm.session+" ("+rcm.year+")";
	
	var vRecomStatus = rcm.status.status_en;
	var vRecomDesc = rcm.title.recommendation_en;
	var vRecomH3SubtTop = "Topics";
	var vRecomH3SubtODS = "SDG";
	var vrecomH3SubtTarg = "Destinations";
	var vrecomH3SubtWrkSp = "Areas of Work";
	var vrecomH3SubtDnudpi = "Articles related to the United Nations Declaration on the Rights of Indigenous Peoples (DNUDPI):";
	var vrecomH3SubtNotes = "Follow up of implementation";
	var vrecomPintroNotes = "Notes and comments on the implementation of this recommendation:";
												
	// Insert values in HTML elements
	recomTit.innerHTML = vRecomTit; //insert text in h1
	recomSubTit.innerHTML = "Of the Permanent Forum on Indigenous Issues (UNPFII)";
	recomSession.innerHTML = vRecomSession; //insert session in span
	recomStatus.innerHTML = vRecomStatus; //insert status in span
	recomDesc.innerHTML = vRecomDesc; // insert description
	recomH3SubtTop.innerHTML = vRecomH3SubtTop; // insert Topic subtitle in h3 
	recomH3SubtODS.innerHTML = vRecomH3SubtODS; // insert ODS subtitle in h3
	recomH3SubtTarg.innerHTML = vrecomH3SubtTarg; // insert target subtitle in h3
	recomH3SubtWrkSp.innerHTML = vrecomH3SubtWrkSp; // insert workspace subtitle in h3
	recomH3SubtDnudpi.innerHTML = vrecomH3SubtDnudpi; // insert workspace subtitle in h3
	recomH3SubtNotes.innerHTML = vrecomH3SubtNotes; // insert note subtitle in h3
	recomPintroNotes.innerHTML = vrecomPintroNotes; //insert paragraph in p
						
	// Build link of session
	var sessionLink = document.createElement('a'); //create link (a) session
	sessionLink.setAttribute("class", "miniButton"); //add class to span
	sessionLink.appendChild(recomSession); // insert span in link
	sessionLink.href = "cluster-en.htm?type=session&id="+rcm.year;
	//insert href in topic link
			
	// Build link of status
	var statusLink = document.createElement('a'); //create link (a) status
	statusLink.setAttribute("class", "miniButton"); //add class to span
	statusLink.appendChild(recomStatus); // insert span in link
	statusLink.href = "cluster-en.htm?type=status&id="+rcm.status.status_id; //insert href in topic link

	// Build topics list
	// Iterates the array of topics (topicArray) *1*
	// Creates individual links
	if (rcm.topic.length != 0) { // if topics is empty
		for (let x = 0; x < rcm.topic.length; ++x) { // loop - number of topics
			var recomTopic = document.createElement("span"); //create span
			var topicLink = document.createElement('a'); //create link (a) topics
			recomTopic.innerHTML = rcm.topic[x].topic_en; //insert topic in span
			topicLink.setAttribute("class", "miniButton"); //add class to span
			topicLink.appendChild(recomTopic); // insert span into link
			topicLink.href = "cluster-en.htm?type=topic&id="+rcm.topic[x].topic_id;
			//insert href into topic link
			recomWrapTopic.appendChild(topicLink); //append span in div wrapper
		}
	}
	
	// Build ODS list
	// Iterates the array of ODS (odsArray) *2*
	// Creates individual links
	// Create individual classes for coloring purposes, regarding the ODS colors
	if (rcm.ods.length != 0) { // if ods is empty
		for (let x = 0; x < rcm.ods.length; ++x) { // loop -number of ods
			var recomODS = document.createElement("span");
			var odsLink = document.createElement('a'); //create link (a) odss
			recomODS.innerHTML = rcm.ods[x].ods_en; //insert ods in span
			// put color on ODS
			if (rcm.ods[x].ods_id === "1") {
				odsLink.setAttribute("class", "miniButton color-ods-1"); //add class
			} else if (rcm.ods[x].ods_id === "2") {
				odsLink.setAttribute("class", "miniButton color-ods-2");
			} else if (rcm.ods[x].ods_id === "3") {
				odsLink.setAttribute("class", "miniButton color-ods-3");
			} else if (rcm.ods[x].ods_id === "4") {
				odsLink.setAttribute("class", "miniButton color-ods-4");
			} else if (rcm.ods[x].ods_id === "5") {
				odsLink.setAttribute("class", "miniButton color-ods-5");
			} else if (rcm.ods[x].ods_id === "6") {
				odsLink.setAttribute("class", "miniButton color-ods-6");
			} else if (rcm.ods[x].ods_id === "7") {
				odsLink.setAttribute("class", "miniButton color-ods-7");
			} else if (rcm.ods[x].ods_id === "8") {
				odsLink.setAttribute("class", "miniButton color-ods-8");
			} else if (rcm.ods[x].ods_id === "9") {
				odsLink.setAttribute("class", "miniButton color-ods-9");
			} else if (rcm.ods[x].ods_id === "10") {
				odsLink.setAttribute("class", "miniButton color-ods-10");
			} else if (rcm.ods[x].ods_id === "11") {
				odsLink.setAttribute("class", "miniButton color-ods-11");
			} else if (rcm.ods[x].ods_id === "12") {
				odsLink.setAttribute("class", "miniButton color-ods-12");
			} else if (rcm.ods[x].ods_id === "13") {
				odsLink.setAttribute("class", "miniButton color-ods-13");
			} else if (rcm.ods[x].ods_id === "14") {
				odsLink.setAttribute("class", "miniButton color-ods-14");
			} else if (rcm.ods[x].ods_id === "15") {
				odsLink.setAttribute("class", "miniButton color-ods-15");
			} else if (rcm.ods[x].ods_id === "16") {
				odsLink.setAttribute("class", "miniButton color-ods-16");
			} else {
				odsLink.setAttribute("class", "miniButton color-ods-17");
			}
			odsLink.appendChild(recomODS); // insert span in link
			odsLink.href = "cluster-en.htm?type=ods&id="+rcm.ods[x].ods_id;
			//insert href in ods link
			recomWrapODS.appendChild(odsLink); //append span in div wrapper
		}
	}
			
	// Build targets list
	// Iterates the array of targets (targetArray)
	// Creates individual links
	if (rcm.target.length != 0) { // if targets is empty
		for (let x = 0; x < rcm.target.length; ++x) { // loop - number of targets
			var recomTarget = document.createElement("span"); //create span
			var targetLink = document.createElement('a'); //create link (a) targets
			recomTarget.innerHTML = rcm.target[x].target_en; //insert topic in span
			targetLink.setAttribute("class", "miniButton"); //add class to span
			targetLink.appendChild(recomTarget); // insert span into link
			targetLink.href = "cluster-en.htm?type=target&id="+rcm.target[x].target_id;
			//insert href into topic link
			recomWrapTarg.appendChild(targetLink); //append span in div wrapper
		}
	}
			
	// Build workspaces list
	// Iterates the array of workspaces (workspaceArray)
	// Creates individual links
	if (rcm.workspace.length != 0) { // if targets is empty
		for (let x = 0; x < rcm.workspace.length; ++x) { // loop - number of workspaces
			var recomWorkspace = document.createElement("span"); //create span
			var workspaceLink = document.createElement('a'); //create link (a) workspaces
			recomWorkspace.innerHTML = rcm.workspace[x].workspace_en; //insert workspace in span
			workspaceLink.setAttribute("class", "miniButton"); //add class to span
			workspaceLink.appendChild(recomWorkspace); // insert span into link
			workspaceLink.href = "cluster-en.htm?type=workspace&id="+rcm.workspace[x].workspace_id;
			//insert href into topic link
			recomWrapWrkSp.appendChild(workspaceLink); //append span in div wrapper
		}
	}

	// Build dnudpi list
	// Iterates the array of dnudpis (dnudpiArray)
	if (rcm.dnudpi.length != 0) { // if dnudpis is empty
		for (let x = 0; x < rcm.dnudpi.length; ++x) { // loop - number of workspaces
			var recomDnudpi = document.createElement("p"); //create p
			recomDnudpi.setAttribute("class", "eachDnudpi"); //add class to dnudpi wrapper
			recomDnudpi.innerHTML = rcm.dnudpi[x].dnudpi_detail_en; //insert workspace in span
			recomWrapDnudpi.appendChild(recomDnudpi); //append span in div wrapper
		}
	}
	
	// Build notes list
	// Iterates the array of notes
	if (rcm.notes.length != 0) { // if dnudpis is empty
		for (let x = 0; x < rcm.notes.length; ++x) { // loop - number of workspaces
			var noteWrapper = document.createElement("div"); //create note wrapper
			noteWrapper.setAttribute("class", "eachNote"); //add class to note wrapper
			
			//insert year
			var noteYearTit = document.createElement("span"); //create span
			var noteYearContent = document.createElement("span"); //create span
			var noteYearWrap = document.createElement("p"); //create p wrapper
			noteYearWrap.setAttribute("class", "noteInfo"); //add class to note wrapper
			noteYearTit.innerHTML = "Year: "; //insert year title in span
			noteYearTit.setAttribute("class", "noteBlack"); //add class to title
			noteYearContent.innerHTML = rcm.notes[x].year; //insert year in span
			noteYearWrap.appendChild(noteYearTit); //append spa in p wrapper
			noteYearWrap.appendChild(noteYearContent); //append spa in p wrapper
			noteWrapper.appendChild(noteYearWrap); //append year in div wrapper
			
			//insert type remit
			var noteTypeRemTit = document.createElement("span"); //create span
			var noteTypeRemContent = document.createElement("span"); //create span
			var noteTypeRemWrap = document.createElement("p"); //create p wrapper
			noteTypeRemWrap.setAttribute("class", "noteInfo"); //add class to note wrapper
			noteTypeRemTit.innerHTML = "Sender type: "; //insert type remit title in span
			noteTypeRemTit.setAttribute("class", "noteBlack"); //add class to remit title
			noteTypeRemContent.innerHTML = rcm.notes[x].type_en; //insert type remit in span
			noteTypeRemWrap.appendChild(noteTypeRemTit); //append spa in p wrapper
			noteTypeRemWrap.appendChild(noteTypeRemContent); //append spa in p wrapper
			noteWrapper.appendChild(noteTypeRemWrap); //append type remit in div wrapper

			//insert remit
			var noteRemTit = document.createElement("span"); //create span
			var noteRemContent = document.createElement("span"); //create span
			var noteRemWrap = document.createElement("p"); //create p wrapper
			noteRemWrap.setAttribute("class", "noteInfo"); //add class to note wrapper
			noteRemTit.innerHTML = "Sender: "; //insert remit title in span
			noteRemTit.setAttribute("class", "noteBlack"); //add class to remit
			noteRemContent.innerHTML = rcm.notes[x].from_en; //insert type remit in span
			noteRemWrap.appendChild(noteRemTit); //append spa in p wrapper
			noteRemWrap.appendChild(noteRemContent); //append spa in p wrapper
			noteWrapper.appendChild(noteRemWrap); //append type remit in div wrapper	
						
			//insert source
			var noteSourceTit = document.createElement("span"); //create span
			var noteSourceContent = document.createElement("span"); //create span
			var noteSourceWrap = document.createElement("p"); //create p wrapper
			noteSourceWrap.setAttribute("class", "noteInfo"); //add class to note wrapper
			noteSourceTit.innerHTML = "Source: "; //insert source in span
			noteSourceTit.setAttribute("class", "noteBlack"); //add class to source
			noteSourceContent.innerHTML = rcm.notes[x].source_en; //insert source in span
			noteSourceWrap.appendChild(noteSourceTit); //append spa in p wrapper
			noteSourceWrap.appendChild(noteSourceContent); //append spa in p wrapper
			noteWrapper.appendChild(noteSourceWrap); //append type source in div wrapper

			//insert scope
			var noteScopeTit = document.createElement("span"); //create span
			var noteScopeContent = document.createElement("span"); //create span
			var noteScopeWrap = document.createElement("p"); //create p wrapper
			noteScopeWrap.setAttribute("class", "noteInfo"); //add class to note wrapper
			noteScopeTit.innerHTML = "Scope: "; //insert scope in span
			noteScopeTit.setAttribute("class", "noteBlack"); //add class to scope
			noteScopeContent.innerHTML = rcm.notes[x].scope_en; //insert scope in span
			noteScopeWrap.appendChild(noteScopeTit); //append spa in p wrapper
			noteScopeWrap.appendChild(noteScopeContent); //append spa in p wrapper
			noteWrapper.appendChild(noteScopeWrap); //append type source in div wrapper	
																	
			//insert note
			var recomNote = document.createElement("p"); //create p
			recomNote.innerHTML = rcm.notes[x].note_en; //insert note in p
			noteWrapper.appendChild(recomNote); //append p in div wrapper

			//insert report link
			var noteReportLink = document.createElement("a"); //create link
			var recomReport = document.createElement("span"); //create span
			recomReport.innerHTML = "Read report »"; //insert link in span
			noteReportLink.setAttribute("class", "miniButton linkReport"); //add class to span
			noteReportLink.setAttribute("target", "_blank");
			noteReportLink.appendChild(recomReport); // insert span into link
			noteReportLink.href = rcm.notes[x].link; //insert href into report link
			noteWrapper.appendChild(noteReportLink); //append span in div wrapper
			
			//insert each note in note wrapper
			recomWrapNotes.appendChild(noteWrapper); //append year in div wrapper
		}
	}
	
	//Build session button
	var SessionReportSp = document.createElement("a");
	var SessionReportEn = document.createElement("a");
	var vSessionReportSp = "Report of session "+rcm.year+" - Spa (.pdf)";
	var vSessionReportEn = "Report of session "+rcm.year+" - Eng (.pdf)";
	SessionReportSp.innerHTML = vSessionReportSp;
	SessionReportEn.innerHTML = vSessionReportEn;
	SessionReportSp.setAttribute("class", "secondaryButton");
	SessionReportEn.setAttribute("class", "secondaryButton");
	SessionReportSp.setAttribute("target", "_blank");
	SessionReportEn.setAttribute("target", "_blank");
	if (parseInt(rcm.session) < 10) {
		var sessionX = "0"+rcm.session;
	} else {
		var sessionX = rcm.session;
	}
	SessionReportSp.href = "files/UNPFII"+sessionX+"-"+rcm.year+"-sp.pdf"
	SessionReportEn.href = "files/UNPFII"+sessionX+"-"+rcm.year+"-en.pdf"
	var toolsDiv = document.getElementById("tools-rcm");
	toolsDiv.appendChild(SessionReportSp);
	toolsDiv.appendChild(SessionReportEn);

	// Build individual recommendation box
	recomWrap.setAttribute("class", "recomWrap2");
	recomDesc.setAttribute("class", "recomDesc");
	recomSubTit.setAttribute("id", "subTitResult");
	contentRcm.appendChild(recomWrap);
	recomWrap.appendChild(recomTit);
	recomWrap.appendChild(recomSubTit);
	recomWrap.appendChild(sessionLink);
	recomWrap.appendChild(statusLink);
	recomWrap.appendChild(recomDesc);
	if (rcm.topic.length != 0) {
		recomWrap.appendChild(recomH3SubtTop);
		recomWrap.appendChild(recomWrapTopic);
	}
	if (rcm.ods.length != 0) {
		recomWrap.appendChild(recomH3SubtODS);
		recomWrap.appendChild(recomWrapODS);
	}
	if (rcm.target.length != 0) {
		recomWrap.appendChild(recomH3SubtTarg);
		recomWrap.appendChild(recomWrapTarg);
	}
	if (rcm.workspace.length != 0) {
		recomWrap.appendChild(recomH3SubtWrkSp);
		recomWrap.appendChild(recomWrapWrkSp);
	}
	if (rcm.dnudpi.length != 0) {
		recomWrap.appendChild(recomH3SubtDnudpi);
		recomWrap.appendChild(recomWrapDnudpi);
	}
	if (rcm.notes.length != 0) {
		recomWrap.appendChild(recomH3SubtNotes);
		recomWrap.appendChild(recomPintroNotes);
		recomWrap.appendChild(recomWrapNotes);
	}
}

function intoMSwordB() {
	var rcm0 = new URLSearchParams(location.search);
	var rcm0 = rcm0.get('rcm');
	// find rcm in api_recomend
	let rcm = recommends.find(o => o.id === rcm0);
	
	var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
				"xmlns:w='urn:schemas-microsoft-com:office:word' "+
				"xmlns='http://www.w3.org/TR/REC-html40'>"+
				"<head><meta charset='utf-8'><title>Recommendation "+rcm.session+"."+rcm.paragraph+":  "+rcm.title.title_recommendation_en+" ("+rcm.year+")"+" of the Permanent Forum on Indigenous Issues (UNPFII)</title></head><body>";
	var footer = "</body></html>";
	var sourceHTML = header+document.getElementById("content-rcm").innerHTML+footer;

	var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
	var fileDownload = document.createElement("a");
	document.body.appendChild(fileDownload);
	fileDownload.href = source;
	fileDownload.download = 'Recom UNPFII '+rcm.session+'.'+rcm.paragraph+'.'+rcm.year+'.doc';
	fileDownload.click();
	document.body.removeChild(fileDownload);
}

//---------------------------------
//---------------------------------
//------- Cluster page ------------
//---------------------------------
//---------------------------------

function listCluster() {
	document.getElementById("light-box").style.display = 'none';
	
	// get params from url
	var type0 = new URLSearchParams(location.search);
	var type0 = type0.get('type');
	var id0 = new URLSearchParams(location.search);
	var id0 = id0.get('id'); // find rcm in api_recomend

	var resultDiv = document.getElementById("resultList"); //define main results wrapper

	//Define cluster and grab name
	if (type0 === "session") { 
		let cluster = recommends.find(o => parseInt(o.year) === parseInt(id0));
		var clusterName = "of the session: #"+cluster.session+" ("+id0+")";
	} else if (type0 === "topic") {
		let cluster = api_topic.find(o => parseInt(o.topic_id) === parseInt(id0));
		var clusterName = "of the topic: "+cluster.topic_en;
	} else if (type0 === "ods") {
		let cluster = api_ods.find(o => parseInt(o.ods_id) === parseInt(id0));
		var clusterName = "of the SDG: "+id0+". "+cluster.ods_en;
	} else if (type0 === "status") {
		let cluster = api_status.find(o => parseInt(o.status_id) === parseInt(id0));
		var clusterName = "in status: "+cluster.status_en;
	} else if (type0 === "target") {
		let cluster = api_target.find(o => parseInt(o.target_id) === parseInt(id0));
		var clusterName = "for target: "+cluster.target_en;
	} else if (type0 === "workspace") {
		let cluster = api_workspace.find(o => parseInt(o.workspace_id) === parseInt(id0));
		var clusterName = "of area of work : "+cluster.workspace_en;
	}
	
	// Set title page
	pageTitle.innerHTML = "Recommendations "+clusterName+" - Permanent Forum on Indigenous Issues (UNPFII) | Yanapaq"; //create title
	document.getElementById("titlResult").innerHTML = "Recomendaciones "+clusterName;
	document.getElementById("subTitResult").innerHTML = "Permanent Forum on Indigenous Issues (UNPFII)"; 	
	//insert title in h1
	var resultsNum = 0;

	for (var i = 0; i < recommends.length; i++) { //iterate api_recomend array by cluster
		
		let topic_bool = recommends[i].topic.find(o => parseInt(o.topic_id) === parseInt(id0));
		let ods_bool = recommends[i].ods.find(o => parseInt(o.ods_id) === parseInt(id0));
		let target_bool = recommends[i].target.find(o => parseInt(o.target_id) === parseInt(id0));
		let workspace_bool = recommends[i].workspace.find(o => parseInt(o.workspace_id) === parseInt(id0));
		
		if (type0 === "session" && (recommends[i].year).includes(id0)) {
		} else if (type0 === "topic" && (topic_bool)) {
		} else if (type0 === "ods" && (ods_bool)) {
		} else if (type0 === "status" && recommends[i].status.status_id === id0 ) {
		} else if (type0 === "target" && (target_bool)) {
		} else if (type0 === "workspace" && (workspace_bool)) {
		} else {
			continue;
		}

		// Create HTML result box elements
		var recomWrap = document.createElement("div");
		var recomSession = document.createElement("span");
		var recomDesc1 = document.createElement("p"); //description part 1
		var recomDesc2 = document.createElement("span"); //description part 2
		var recomDescLink = document.createElement("a");
		var recomH3SubtTop = document.createElement("h3");
		var recomWrapTopic = document.createElement("div");
		var recomH3SubtODS = document.createElement("h3");
		var recomWrapODS = document.createElement("div");
		var recomTit = document.createElement("h2"); //create h2 title
		var recomTitLink = document.createElement('a'); //create link (a) title
	
		// Define values before inserting into box elements
		// vRecomDesc pulls the recomendation from api_recomend
		// topicArray is an array created from the topic_ids, turning a string into an 
		// array the separated by comma [1,2,3]
		// vRecomDesc1 & vRecomDesc2 is recomm description in 2 parts to create later 
		// the "view more" link
		// odsArray, the same as topicArray
		var vRecomTit = "Recommendation "+recommends[i].session+"."+recommends[i].paragraph+": "+recommends[i].title.title_recommendation_en+" »"; 
		var vRecomSession = "Session #"+recommends[i].session+" ("+recommends[i].year+")";
		var vRecomDesc = recommends[i].title.recommendation_en;
		var vRecomDesc1 = vRecomDesc.slice(0, 370); //part 1 description of 370 chars
		var vRecomDesc2 = vRecomDesc.slice(370, 5000); // part 2
		var vRecomH3SubtTop = "Topics";
		//console.log(results[i].item.id); //debugg topic
		var vRecomH3SubtODS = "SDG";
		//console.log(results[i].item.ods_id);
	
		// Build Recommendation link to detail page
		// Here is when the individual recommendation link is created
		recomTit.innerHTML = vRecomTit; //insert text in h2
		recomTitLink.setAttribute("class", "recom-title"); //add class to link (a)
		recomTitLink.appendChild(recomTit); // insert h2 in link (a)
		recomTitLink.href = "recomm_detail-en.htm?rcm="+recommends[i].id; //insert href in (a)
								
		// Insert values in HTML elements
		recomSession.innerHTML = vRecomSession; //insert session in span
		recomH3SubtTop.innerHTML = vRecomH3SubtTop; // insert Topic subtitle in h3 
		recomH3SubtODS.innerHTML = vRecomH3SubtODS; // insert ODS subtitle in h3
		recomDesc1.innerHTML = vRecomDesc1; // insert description part1 (p)
		recomDesc2.innerHTML = vRecomDesc2; // insert description part2 (span)
						
		// Build link of session
		var sessionLink = document.createElement('a'); //create link (a) session
		sessionLink.setAttribute("class", "miniButton"); //add class to span
		sessionLink.appendChild(recomSession); // insert span in link
		sessionLink.href = "cluster-en.htm?type=session&id="+recommends[i].year;
		//insert href in topic link

		// Build recommendation description with link "view more"
		// Verify if description usses the part 2, otherwise don't insert link "view more"
		javascriptText = "document.getElementById('descrip"+i+"').style.display = 'inline';document.getElementById('vermas"+i+"').style.display = 'none'"; // build javascript to insert in a
		recomDescLink.href = "javascript:void(0);"; //insert href into a with JS to avoid scroll
		recomDescLink.setAttribute("onclick", javascriptText); //insert onclick into a
		recomDescLink.innerHTML = "(..view more)"; // insert text in link
		recomDescLink.setAttribute("id", "vermas"+i); //add id to link
		recomDesc1.appendChild(recomDesc2); // insert span in p (description)
		if (vRecomDesc2 != "") { //verify if description part 2 is not empty
			recomDesc1.appendChild(recomDescLink); // then insert a in p
		}
		recomDesc2.setAttribute("style", "display:none"); //add hidden style
		recomDesc2.setAttribute("id", "descrip"+i); //add hidden style

		// Build topics list
		// Iterates the array of topics (topicArray) *1*
		// Creates individual links
		if (recommends[i].topic.length != 0) { // if topics is empty
			for (let x = 0; x < recommends[i].topic.length; ++x) { // loop - number of topics
				var recomTopic = document.createElement("span"); //create span
				var topicLink = document.createElement('a'); //create link (a) topics
				recomTopic.innerHTML = recommends[i].topic[x].topic_en; //insert topic in span
				topicLink.setAttribute("class", "miniButton"); //add class to span
				topicLink.appendChild(recomTopic); // insert span into link
				topicLink.href = "cluster-en.htm?type=topic&id="+recommends[i].topic[x].topic_id;
				//insert href into topic link
				recomWrapTopic.appendChild(topicLink); //append span in div wrapper
			}
		}

		// Build ODS list
		// Iterates ods *2*
		// Creates individual links
		// Create individual classes for color purposes
		if (recommends[i].ods.length != 0) { // if ods is empty
			for (let x = 0; x < (recommends[i].ods).length; ++x) { // loop -number of ods
				var recomODS = document.createElement("span");
				var odsLink = document.createElement('a'); //create link (a) odss
				recomODS.innerHTML = recommends[i].ods[x].ods_en; //insert ods in span
				// put color on ODS
				var n_id = recommends[i].ods[x].ods_id;
				if (n_id === "1") {
					odsLink.setAttribute("class", "miniButton color-ods-1"); //add class
				} else if (n_id === "2") {
					odsLink.setAttribute("class", "miniButton color-ods-2");
				} else if (n_id === "3") {
					odsLink.setAttribute("class", "miniButton color-ods-3");
				} else if (n_id === "4") {
					odsLink.setAttribute("class", "miniButton color-ods-4");
				} else if (n_id === "5") {
					odsLink.setAttribute("class", "miniButton color-ods-5");
				} else if (n_id === "6") {
					odsLink.setAttribute("class", "miniButton color-ods-6");
				} else if (n_id === "7") {
					odsLink.setAttribute("class", "miniButton color-ods-7");
				} else if (n_id === "8") {
					odsLink.setAttribute("class", "miniButton color-ods-8");
				} else if (n_id === "9") {
					odsLink.setAttribute("class", "miniButton color-ods-9");
				} else if (n_id === "10") {
					odsLink.setAttribute("class", "miniButton color-ods-10");
				} else if (n_id === "11") {
					odsLink.setAttribute("class", "miniButton color-ods-11");
				} else if (n_id === "12") {
					odsLink.setAttribute("class", "miniButton color-ods-12");
				} else if (n_id === "13") {
					odsLink.setAttribute("class", "miniButton color-ods-13");
				} else if (n_id === "14") {
					odsLink.setAttribute("class", "miniButton color-ods-14");
				} else if (n_id === "15") {
					odsLink.setAttribute("class", "miniButton color-ods-15");
				} else if (n_id === "16") {
					odsLink.setAttribute("class", "miniButton color-ods-16");
				} else {
					odsLink.setAttribute("class", "miniButton color-ods-17");
				}
				odsLink.appendChild(recomODS); // insert span in link
				odsLink.href = "cluster-en.htm?type=ods&id="+n_id; //insert href in ods link
				recomWrapODS.appendChild(odsLink); //append span in div wrapper
			}
		}

		// Build individual recommendation boxes
		recomWrap.setAttribute("class", "recomWrap");
		resultDiv.appendChild(recomWrap);
		recomWrap.appendChild(recomTitLink);
		recomWrap.appendChild(sessionLink);
		recomWrap.appendChild(recomDesc1);
		if (recommends[i].topic.length != 0) {
			recomWrap.appendChild(recomH3SubtTop);
			recomWrap.appendChild(recomWrapTopic);
		}
		if (recommends[i].ods.length != 0) {
			recomWrap.appendChild(recomH3SubtODS);
			recomWrap.appendChild(recomWrapODS);
		}
		//calc number of results
		var resultsNum = resultsNum + 1;
	}
	document.getElementById("numFound").innerHTML = resultsNum;
}

function intoMSwordC(){
	var numFound = parseInt(document.getElementById("numFound").innerHTML);
	//open description and hide vermas
	for (var i = 0; i < numFound; i++) {
		var descrip = "descrip"+i;
		var vermas = "vermas"+i;
		var element1 = !!document.getElementById(descrip); //verify if DOM exist
		var element2 = !!document.getElementById(vermas); //verify if DOM exist
		if (element1 && element2) { //verify if DOM exist
			document.getElementById(descrip).style.display = 'inline';
			document.getElementById(vermas).style.display = 'none';
		}
	}
	// get params from url
	var type0 = new URLSearchParams(location.search);
	var type0 = type0.get('type');
	var id0 = new URLSearchParams(location.search);
	var id0 = id0.get('id'); // find rcm in api_recomend

	//Define cluster and grab name
	if (type0 === "session") { 
		let cluster = recommends.find(o => parseInt(o.year) === parseInt(id0));
		var clusterName = "of the session: #"+cluster.session+" ("+id0+")";
	} else if (type0 === "topic") {
		let cluster = api_topic.find(o => parseInt(o.topic_id) === parseInt(id0));
		var clusterName = "of the topic: "+cluster.topic_en;
	} else if (type0 === "ods") {
		let cluster = api_ods.find(o => parseInt(o.ods_id) === parseInt(id0));
		var clusterName = "of the SDG: "+id0+". "+cluster.ods_en;
	} else if (type0 === "status") {
		let cluster = api_status.find(o => parseInt(o.status_id) === parseInt(id0));
		var clusterName = "in status: "+cluster.status_en;
	} else if (type0 === "target") {
		let cluster = api_target.find(o => parseInt(o.target_id) === parseInt(id0));
		var clusterName = "for target: "+cluster.target_en;
	} else if (type0 === "workspace") {
		let cluster = api_workspace.find(o => parseInt(o.workspace_id) === parseInt(id0));
		var clusterName = "of area of work : "+cluster.workspace_en;
	}
	
	var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
				"xmlns:w='urn:schemas-microsoft-com:office:word' "+
				"xmlns='http://www.w3.org/TR/REC-html40'>"+
				"<head><meta charset='utf-8'><title>Recommendations "+clusterName+" - Permanent Forum on Indigenous Issues (UNPFII)</title></head><body>";
	var footer = "</body></html>";
	var sourceHTML = header+document.getElementById("cluster").innerHTML+footer;
		       
	var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
	var fileDownload = document.createElement("a");
	document.body.appendChild(fileDownload);
	fileDownload.href = source;
	fileDownload.download = 'Recom UNPFII '+type0+'.'+id0+'.doc';
	fileDownload.click();
	document.body.removeChild(fileDownload);
}

function showFilt() {
	document.getElementById("filters").style.display = 'block';
	document.getElementById("showFilt").style.display = 'none';
	document.getElementById("hideFilt").style.display = 'block';
}
function hideFilt() {
	document.getElementById("filters").style.display = 'none';
	document.getElementById("showFilt").style.display = 'block';
	document.getElementById("hideFilt").style.display = 'none';
}