import * as sys from "@sys";
import * as sciter from "@sciter";
import * as debug from "@debug";

const PIPE_NAME = "inspector-js";

var outbound = null; // function used to send stuff to inspector
                     // we have a connection if it is not null 

// commands - executed by request of inspector
const commands = {};

// logs +++++++
var logs = []; // logs buffer - storage for logged items 

function drainLogs() {
  var tlogs = logs; logs = [];
  outbound("logs", tlogs);
}

function rqDrainLogs() {
  //if(logs.length > 10)
  //  drainLogs();
  //else
  document.timer(32,drainLogs ); 
}

/*
  enum OUTPUT_SUBSYTEMS {
    OT_DOM = 0, // html parser & runtime
    OT_CSSS = 1,    // csss! parser & runtime
    OT_CSS = 2,     // css parser
    OT_SCRIPT = 3,  // script parser & runtime
  };
  enum OUTPUT_SEVERITY {
    OS_INFO,
    OS_WARNING,
    OS_ERROR,
  };
*/

function log(subs,kind,args) {
  if(logs.length >= 500) logs.shift();
  //let sublimated_args = args.map(debug.sublimatedValue);
  logs.push([subs,kind,debug.sublimatedPrint(args)]);
  if(outbound)
    rqDrainLogs(); // throttling messages
  else
    console.out(subs,kind,args);
  return true; // handled
}


// logs --------


// script debugger ++++++

var atBreakpointResponse = null;

function breakpointHandler(filename,lineno,stackTrace) 
{
  // this gets called either on breakpoint hit or on steps
  //console.print(filename,lineno,"\n");
  if(!outbound)
    return 0; //DEBUGGER_CONTINUE

  atBreakpointResponse = null;
  outbound("atBreakpoint", [filename,lineno,stackTrace]);

  document.state.disabled = true;
  
  while(outbound) {
    Window.this.doEvent("IO"); // lock, do only IO events until we have response from inspector
    if(atBreakpointResponse === null) 
      continue; // spin until we will not get something from inspector 
    var [op,data] = atBreakpointResponse;
    switch(op) {
      case "step":
        document.state.disabled = false;
        return data; // 0-DEBUGGER_CONTINUE, 1-DEBUGGER_STEP_IN, 2-DEBUGGER_STEP_OUT, 3-DEBUGGER_STEP_OVER
      case "variables": {
        var variables = debug.frameVariables(data+2);
        outbound("frameVariables",variables);
        atBreakpointResponse = null;
        continue; // continue polling
      }
      case "eval":        
        atBreakpointResponse = null;
        continue; // continue polling
    }
  }
  document.state.disabled = false;
  return 0; //DEBUGGER_CONTINUE
}

//debug.setBreakpointHandler(breakpointHandler);

commands.breakpoints = function(breakpoints) {
  debug.setBreakpoints(breakpoints);
  /*if(breakpoints && breakpoints.length)
    debug.setBreakpointHandler(breakpointHandler);
  else 
    debug.setBreakpointHandler(null); // ??*/
}

commands.atBreakpointResponse = function(response) {
  atBreakpointResponse = response;
}


// script debugger ------


// files/requests +++

var files = [];

function postFiles() { 
  const t = files; files = [];
  //console.print("postFiles",JSON.stringify(t));
  outbound("files", t);
}

function rqFilesUpdate() {
  document.timer(1000, postFiles ); 
}

// files/requests ---

function serializeElement(el) {
  function atts() {
    var a = {};
    for( let name of el.getAttributeNames() ) 
      a[name] = el.getAttribute(name);
    return a;
  }
  function text() {
    return el.childElementCount ? null : el.innerText;
  }
  return {
    uid: debug.getUIDofElement(el), 
    tag: el.tag, 
    atts: atts(), 
    length: el.childElementCount, 
    text: text() 
  };
}

function elementStack(el)
{
  var stack = [];
  while( el ) 
  {
    stack.unshift(serializeElement(el));
    if( el === document ) break;
    el = debug.nodeParent(el);
  }  
  return stack;
}


const RE_NONSPACES = /\S/;

// gets content of the element by its UID
commands.contentOf = function(elementUID) 
{
  var list = [];
  var element = !elementUID? document : debug.getElementByUID(elementUID);
  if( element instanceof Element ) {
    if( element.childElementCount )
      for(var n of debug.elementNodes(element)) {
        if( n instanceof Element )
          list.push( serializeElement(n) );
        else if(n instanceof Node) {
          var t = n.data.trim();
          if( t ) list.push( t );
          else continue;
        }
        if(list.length >= 100) {
          list.push( `${element.childElementCount - 100} elements more ...` );
          break;
        }
      }
    else
      return element.innerText;
  }
  return list;
}

commands.highlightElement = function(elementUID) {
  var element = debug.getElementByUID(elementUID);
  debug.highlightElement(element);
}

commands.stackOf = function(elementUID) 
{
  var element = elementUID === null ? document : debug.getElementByUID(elementUID);
  return elementStack(element);
};

commands.detailsOf = function(elementUID) 
{
  let element = debug.getElementByUID(elementUID);
  let details = null;
  if( element instanceof Element ) {
    details = debug.getStyleRulesOfElement(element) || {}; 
    let states = []; // list of "on" states only
    for( let sn in element.elementState ) {
      let st = element.elementState[sn];
      if( st === true ) 
        states.push(sn);
    }
    details.states = states;
    
    details.metrics = {
      inner:   element.elementState.box("xywh","inner","window",true),
      padding: element.elementState.box("ltrb","padding","inner",true),
      border:  element.elementState.box("ltrb","border","padding",true),
      margin:  element.elementState.box("ltrb","margin","border",true),
      content: element.elementState.box("intrinsics"),
      dppx: sciter.devicePixels(1)
    };
  } 
  return details;  
}

commands.toeval = function(text) {
  try {
    // call text in context of this <= element
    console.log(function(str){ return eval(str);}.call(debug.highlightedElement() || document,text));
  } catch(e) {
    console.warn(e.message);
  }
}

commands.objectElements = function(reference) {
  return debug.sublimatedValueElements(reference);
}


// handle request coming from inspector
function handle(name,data) {
  let fcn = commands[name];
  if(fcn) return fcn(data);
  else console.print('unknown rq from inspector',name);
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// snapshot ++++++

function postSnapshot() {
  let [w,h] = document.elementState.box("dimension","border");
  if( !w || !h ) return;
  let dw = 64,dh = 64;
  if(w > h) dh *= w / h; else dw *= h / w; 
  let image = new Graphics.Image(document, w, h, dw, dh ); // make snapshot of the element in the image    
  if( image ) {
    var bytes = image.toBytes("png");
    outbound("snapshot", bytes); 
  }
}

function rqSnapshotUpdate() {
  document.timer(1000, postSnapshot ); 
}


// snapshot ------

async function run() 
{

  debug.setResourceArrivalHandler(function(response) {

    const mt = response.mimeType;
    const astext = mt.startsWith("text/") || mt.endsWith("/json") || mt.endsWith("javascript");

    const rsdef = 
    {
      rqType: response.request.context,
      rqMethod: response.request.method,
      rqUrl: response.request.url,
      rsUrl: response.url,
      rqHeaders: response.request.headers,    
      rsStatus: response.status,
      rsHeaders: response.responseHeaders,
      rsMimeType: response.mimeType,
      rsData: astext ? response.text() 
              : response.request.url.startsWith("file:") ? null
              : response.arrayBuffer()
    };

    files.push(rsdef);
    if(files.length > 100) files.shift();
    if(!outbound) return;
    rqFilesUpdate();
  });

  debug.setConsoleOutputHandler(function(subsytem,severity,msg) {
    //if(!outbound) 
    //  return false; // proceed with default handler  
    log(subsytem,severity,[msg]);
    return true; // done, consumed
  });

  globalThis.console.log = (...args) => log(3,0,args);
  globalThis.console.warn = (...args) => log(3,1,args);
  globalThis.console.error = (...args) => log(3,2,args);

  var pipe = new sys.Pipe();
  let bstream = new BJSON(); // Binary JSON stream
  var rqnumber = 0;

  let awaitingResponses = []; // list of callbacks awaiting responses

  document.on("keyup.debug-peer", function(evt) {
    if(evt.code == "F5") {
      document.dispatchEvent(new Event("reloaddocument", {bubbles:true}),true);
      return false; // consume the event
    }
  });
  
  do {
    try {
      await pipe.connect(PIPE_NAME);
      break;
    } catch (e) {
      if(e.message == "no such file or directory") {
        await timeout(2000);
        continue;
      }
      //pipe.close();
      //return; // no luck
    }
  } while(document);

  debug.setBreakpointHandler(breakpointHandler);

  document.on("unload.debug-peer", () => { 
      drainLogs();
      debug.setBreakpointHandler(null); 
      for(let n = 0; n < 100; ++n)
        if(!Window.this.doEvent("I/O")) break;
      if(pipe)
        pipe.close();  
    });
    document.on("^contentchange.debug-peer", rqSnapshotUpdate );  
    document.on("^input.debug-peer", rqSnapshotUpdate );
    document.on("^mousedown.debug-peer", function(evt) 
    { 
      if( evt.ctrlKey && evt.shiftKey && evt.target ) 
      {
        var stack = elementStack(evt.target);
        outbound("highlighted",stack); 
        debug.highlightElement(evt.target);
        return true; // consume
      }
  });

  document.on("^mouseup.debug-peer",function(evt) 
  { 
    if( evt.ctrlKey && evt.shiftKey )
      return true; // consume it
  });     

  outbound = function(name,data,callback = null) {
      try {
        if(callback) {
          awaitingResponses.push(callback);
          pipe.write(bstream.pack([name,true,data]));
        } else {
          pipe.write(bstream.pack([name,false,data]));
        }
      } catch (e) {
        if(e.message != "broken pipe")
          Window.this.modal(<alert>Inspector communication error: {e.message} <pre>{e.stack}</pre></alert>,{debug:false});
      }
  }

  outbound("hello",debug.containerId());

  rqDrainLogs();
  rqSnapshotUpdate();
  rqFilesUpdate();

  try {
    while (document && pipe) {
      var data = await pipe.read();
      if (!data) {
        //console.print('connection closed!');
        break;
      }

      bstream.unpack(data, (message) => {
        const [name,needresp,data] = message;
        if( name == "resp")
          awaitingResponses.shift()(data);
        else {
          let answer = handle(name,data);
          if( needresp )
            pipe.write(bstream.pack(["resp",false,answer]));
        }
      });
    }
    if(pipe)
       pipe.close();      
  } catch (e) {
    if(e) Window.this.modal(<alert>Inspector communication error: {e.message} <pre>{e.stack}</pre></alert>, {debug:false});
  }
  debug.highlightElement(null);
}

if(sys.Pipe && (document.attributes["disable-debug"] === undefined))
  run();

