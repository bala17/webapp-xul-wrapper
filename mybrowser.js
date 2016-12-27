// nsIWebProgressListener implementation to monitor activity in the browser.
var PRODUCT_REGISTRY_KEY = "MAGIC";
var doc = null;
var objRecentTestList = null;

function WebProgressListener() {
}
WebProgressListener.prototype = {
  _requestsStarted: 0,
  _requestsFinished: 0,
  // We need to advertize that we support weak references.  This is done simply
  // by saying that we QI to nsISupportsWeakReference.  XPConnect will take
  // care of actually implementing that interface on our behalf.
  QueryInterface: function(iid) {
    if (iid.equals(Components.interfaces.nsIWebProgressListener) ||
        iid.equals(Components.interfaces.nsISupportsWeakReference) ||
        iid.equals(Components.interfaces.nsISupports))
      return this;
    
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  // This method is called to indicate state changes.
  onStateChange: function(webProgress, request, stateFlags, status) {
    const WPL = Components.interfaces.nsIWebProgressListener;

    var progress = document.getElementById("progress");

    if (stateFlags & WPL.STATE_IS_REQUEST) {
      if (stateFlags & WPL.STATE_START) {
        this._requestsStarted++;
      } else if (stateFlags & WPL.STATE_STOP) {
        this._requestsFinished++;
      }
      if (this._requestsStarted > 1) {
        var value = (100 * this._requestsFinished) / this._requestsStarted;
        progress.setAttribute("mode", "determined");
        progress.setAttribute("value", value + "%");
      }
    }

    if (stateFlags & WPL.STATE_IS_NETWORK) {
      var stop = document.getElementById("stop");
      if (stateFlags & WPL.STATE_START) {
        stop.setAttribute("disabled", false);
        progress.setAttribute("style", "");
      } else if (stateFlags & WPL.STATE_STOP) {
        stop.setAttribute("disabled", true);
        progress.setAttribute("style", "display: none");
        this.onStatusChange(webProgress, request, 0, "Done");
        this._requestsStarted = this._requestsFinished = 0;
      }
    }
  },

  // This method is called to indicate progress changes for the currently
  // loading page.
  onProgressChange: function(webProgress, request, curSelf, maxSelf,
                             curTotal, maxTotal) {
    if (this._requestsStarted == 1) {
      var progress = document.getElementById("progress");
      if (maxSelf == -1) {
        progress.setAttribute("mode", "undetermined");
      } else {
        progress.setAttribute("mode", "determined");
        progress.setAttribute("value", ((100 * curSelf) / maxSelf) + "%");
      }
    }
  },

  // This method is called to indicate a change to the current location.
  onLocationChange: function(webProgress, request, location) {
    var urlbar = document.getElementById("urlbar");
    urlbar.value = location.spec;

    var browser = document.getElementById("browser");
    var back = document.getElementById("back");
    var forward = document.getElementById("forward");

    back.setAttribute("disabled", !browser.canGoBack);
    forward.setAttribute("disabled", !browser.canGoForward);
  },

  // This method is called to indicate a status changes for the currently
  // loading page.  The message is already formatted for display.
  onStatusChange: function(webProgress, request, status, message) {
    var status = document.getElementById("status");
    status.setAttribute("label", message);
  },

  // This method is called when the security state of the browser changes.
  onSecurityChange: function(webProgress, request, state) {
    const WPL = Components.interfaces.nsIWebProgressListener;

    var sec = document.getElementById("security");

    if (state & WPL.STATE_IS_INSECURE) {
      sec.setAttribute("style", "display: none");
    } else {
      var level = "unknown";
      if (state & WPL.STATE_IS_SECURE) {
        if (state & WPL.STATE_SECURE_HIGH)
          level = "high";
        else if (state & WPL.STATE_SECURE_MED)
          level = "medium";
        else if (state & WPL.STATE_SECURE_LOW)
          level = "low";
      } else if (state & WPL_STATE_IS_BROKEN) {
        level = "mixed";
      }
      sec.setAttribute("label", "Security: " + level);
      sec.setAttribute("style", "");
    }
  }
};


function CommandLineObserver() 
{  
	this.register();
}
CommandLineObserver.prototype = {  
	observe: function(aSubject, aTopic, aData) {     
		var cmdLine = aSubject.QueryInterface(Components.interfaces.nsICommandLine);     
		var path = cmdLine.handleFlagWithParam("apppath", false);     
		apppath= path;
	},   
	register: function() {    
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "commandline-args-changed", false);  
	},   
	unregister: function() {    
			var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);    
			observerService.removeObserver(this, "commandline-args-changed");  
	}}

var listener;

function go() {
  var urlbar = document.getElementById("urlbar");
  var browser = document.getElementById("browser");

  browser.loadURI(urlbar.value, null, null);
}

function back() {
  var browser = document.getElementById("browser");
  browser.stop();
  browser.goBack();
}

function forward() {
  var browser = document.getElementById("browser");
  browser.stop();
  browser.goForward();
}

function reload() {
  var browser = document.getElementById("browser");
  browser.reload();
}

function stop() {
  var browser = document.getElementById("browser");
  browser.stop();
}

function showConsole() {
  window.open("chrome://global/content/console.xul", "_blank",
    "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar");
}

function getAppDirectory() {
	var DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1", "nsIProperties");
	var path = (new DIR_SERVICE()).get("AChrom", Components.interfaces.nsIFile).path;
	var appletPath;
	path = path.replace(/\\/g, '/');
		appletPath = "file:///"+path + "/content/deault.htm";
	return appletPath;
}

function getUserDirectory() {
	var DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1", "nsIProperties");
	var path = (new DIR_SERVICE()).get("Progs", Components.interfaces.nsIFile).path;
	var appletPath;
	// find directory separator type
	if (path.search(/\\/) != -1)
	{
		appletPath = path + "\\myapp\\content\\index.html";
	}
	else
	{
		appletPath = path + "/myapp/content/index.html";
	}
	return appletPath;
}


function saveData()
{
	var savefile = "blogentry.txt";
	try {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to save file was denied.");
	}
	// get the path to the user's home (profile) directory
	const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
	try {
		path=(new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path;
	} catch (e) {
	alert("error");
	}
	// determine the file-separator
	if (path.search(/\\/) != -1) {
		path = path + "\\";
	} else {
		path = path + "/";
	}
	savefile = path+savefile;
	alert(savefile);
}

function registryRootKey()
{
	var wrk = Components.classes["@mozilla.org/windows-registry-key;1"].createInstance(Components.interfaces.nsIWindowsRegKey);
	wrk.open(wrk.ROOT_KEY_CURRENT_USER,"SOFTWARE", wrk.ACCESS_WRITE);
	return wrk;
}
function writeRegistoryKey(key,value)
{
	var wrk = registryRootKey();
	if (wrk.hasChild(PRODUCT_REGISTRY_KEY)) 
	{
		wrk.open(wrk.ROOT_KEY_CURRENT_USER,"SOFTWARE\\"+PRODUCT_REGISTRY_KEY, wrk.ACCESS_WRITE);
	}
	else
	{
		wrk.create(wrk.ROOT_KEY_CURRENT_USER,"SOFTWARE\\"+PRODUCT_REGISTRY_KEY, wrk.ACCESS_WRITE);
	}
	wrk.writeStringValue(key, value);
	wrk.close();
}

function removeChildrenRecursive(wrk)
{
  // we count backwards because we're removing them as we go
  for (var i = wrk.childCount - 1; i >= 0; i--) {
    var name   = wrk.getChildName(i);
    var subkey = wrk.openChild(name, wrk.ACCESS_ALL);
    removeChildrenRecursive(subkey);
    subkey.close();
	alert(subkey);
    wrk.removeChild(name);
  }
}

function deleteRegistoryKey(key)
{
	var wrk = registryRootKey();
	if (wrk.hasChild(PRODUCT_REGISTRY_KEY)) 
	{
		wrk.open(wrk.ROOT_KEY_CURRENT_USER,"SOFTWARE\\"+PRODUCT_REGISTRY_KEY, wrk.ACCESS_ALL);
		if(wrk.hasValue(key))
		{
			wrk.removeValue(key);
		}
	}
	wrk.close();
}

function readRegistryKey(key)
{
	var wrk = registryRootKey();
	if (wrk.hasChild(PRODUCT_REGISTRY_KEY)) 
	{
		var subkey = wrk.openChild(PRODUCT_REGISTRY_KEY, wrk.ACCESS_READ);
		if(subkey.hasValue(key))
		{
			var registryvalue = subkey.readStringValue(key);
			subkey.close();
			wrk.close();
			return registryvalue;
		}
		else
		{
			subkey.close();wrk.close();
			return "-1";
		}
	}
	else
	{
		wrk.close();
		return "-2";
	}
}

function readRegistryValue(value)
{
	var wrk = registryRootKey();
	var subkey = wrk.openChild(PRODUCT_REGISTRY_KEY, wrk.ACCESS_READ);
	var id = subkey.readStringValue("ProductId");
	subkey.close();
	wrk.close();
  switch (wrk.getValueType(value)) {
    case wrk.TYPE_STRING:
      return wrk.readStringValue(value);
    case wrk.TYPE_BINARY:
      return wrk.readBinaryValue(value);
    case wrk.TYPE_INT:
      return wrk.readIntValue(value);
    case wrk.TYPE_INT64:
      return wrk.readInt64Value(value);
  }
  // unknown type
  return null;
}

function fillTooltip(tooltip)
{
  // Walk up the DOM hierarchy until we find something with a title attribute 
  var node = document.tooltipNode;
  while (node && !node.hasAttribute("title"))
 {
   if(node.hasAttribute("title")=='')
  node = null;//node.parentNode;
   else
    node.hasAttribute("title");
 }
  // Don't show tooltip if we didn't find anything
  if (!node)
    return false;

  // Fill in tooltip text and show it
  tooltip.setAttribute("label", node.getAttribute("title"));
  return true;
}



function getAppBaseDirectory() {
	var DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1", "nsIProperties");
	var path = (new DIR_SERVICE()).get("AChrom", Components.interfaces.nsIFile).path;
	var appletPath;
	//path = path.replace(/\\/g, '/');
		appletPath = path;
	return appletPath;
}
function getAppRootDirectory() {
	var DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1", "nsIProperties");
	var path = (new DIR_SERVICE()).get("AChrom", Components.interfaces.nsIFile).path;
	var appletPath;
	//path = path.replace(/\\/g, '/');
	appletPath = path + "\\content\\";
	if (getOS()!='win')
		appletPath = path + "/content/";
	return appletPath;
}
function getAppFileDirectory() {
	var DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1", "nsIProperties");
	var path = (new DIR_SERVICE()).get("AChrom", Components.interfaces.nsIFile).path;
	var appletPath;
	path = path.replace(/\\/g, '/');
		appletPath = "file:///"+path + "/content/";
	return appletPath;
}

/**
 * Write data innew file or existing file at providing location
 * @param location as "Achrom" , sub location "app" , file name and data
 **/
function writeFile(applocation, folderPath,filename, data) 
{
	Components.utils.import("resource://gre/modules/FileUtils.jsm"); 
	var myFile = FileUtils.getFile(applocation, folderPath, true);
	myFile.append(filename); 
	if ( myFile.exists() == false ) 
		 myFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE); 
	Components.utils.import("resource://gre/modules/NetUtil.jsm"); 
	var ostream = FileUtils.openSafeFileOutputStream(myFile); 
	var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter); 
	converter.charset = "UTF-8"; 
	var istream = converter.convertToInputStream(data); 
	NetUtil.asyncCopy(istream, ostream, function(status) { 
		if (!Components.isSuccessCode(status))  
			return; 
	});
}

/**
* Read data from file at providing location
* @param location as "Achrom" , sub location "app" and file name
**/
function readFile(location, folderPath,filename) {
	Components.utils.import("resource://gre/modules/FileUtils.jsm"); 
	var myFile = FileUtils.getFile(location, folderPath, true);
	myFile.append(filename); 
	if (myFile.exists() == false) 
		myFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE); 
	var data = ""; 
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream); 
	var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(Components.interfaces.nsIConverterInputStream); 
	fstream.init(myFile, "-1", "0", "0"); 
	cstream.init(fstream, "UTF-8", "0", "0"); 
		var str = {};
			     
		var read = "0"; 
		do { 
			read = cstream.readString("0xffffffff", str); 
			data += str.value; 
		} while (read != "0"); 
	cstream.close();  
	return data; 
}

/**
 * Write data in new file or existing file at provided location
 * @param File object with full path, data as string.
 **/
function writeFileToPath(myFile, data, fileName) 
{
	// To add file extension to file.
	if (fileName != "")
	{
		 var m = myFile.parent;
		 m.append(fileName);
		 myFile = m;
	}

	Components.utils.import("resource://gre/modules/FileUtils.jsm"); 
	if ( myFile.exists() == false ) 
		 myFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE); 
	Components.utils.import("resource://gre/modules/NetUtil.jsm"); 
	var ostream = FileUtils.openSafeFileOutputStream(myFile); 
	var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter); 
	converter.charset = "UTF-8"; 
	var istream = converter.convertToInputStream(data); 
	NetUtil.asyncCopy(istream, ostream, function(status) { 
		if (!Components.isSuccessCode(status))  
			return; 
	});
}

function getSeperator()
{
    if (getOS() == 'win')
        return '\\';
    else
        return '/';
}

function convertHTMLToDoc(exportData, exportTchData, imageData, fileName, copyType)
{	
	// To open save as dialog box.
	var fl = null;
	var nsIFilePicker = Components.interfaces.nsIFilePicker;

	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.appendFilter("Document files", "*.doc");
	fp.init(window, "Save As", nsIFilePicker.modeSave); // modeSave // modeGetFolder
    fp.defaultString = fileName;

	var res = fp.show();
	if (res != nsIFilePicker.returnCancel)
	{
		var thefile = fp.file;
		var fileName = "";
        var teacherFileName = "";
		
        teacherFileName = thefile.path;
		teacherFileName = teacherFileName.substring(teacherFileName.lastIndexOf(getSeperator()) + 1);
		teacherFileName = teacherFileName + "_Teacher" + ".doc";
        
        fileName = thefile.path;
		if (fileName.indexOf(".doc") > 0)
		{
            fileName = fileName.substring(0,fileName.lastIndexOf(".doc"));
        }
        fileName = fileName.substring(fileName.lastIndexOf(getSeperator()) + 1);

        teacherFileName = fileName + "_Teacher" + ".doc";
  		fileName = fileName + ".doc";

        if (copyType == "Student" || copyType == "Both")
            writeFileToPath(thefile, exportData, fileName);
         
        if (copyType == "Teacher" || copyType == "Both")
		{
            if (copyType == "Teacher")
                teacherFileName = fileName;

            writeFileToPath(thefile, exportTchData, teacherFileName);
        }
		
        //writeFile("AChrom",["content"],"Report.html",exportData);

		//Code to copy image
		if (imageData != null && imageData != "")
		{
            Components.utils.import("resource://gre/modules/FileUtils.jsm"); 
			var rootDir = getAppRootDirectory();
			createFolderStructure(fp.file.parent, ["content","graphics"]);

			var arrImages = imageData.split("|"); 
			
            for (var i = 0; i < arrImages.length; i++ )
			{
				var image = arrImages[i];				
				image = image.substr(image.lastIndexOf("/")+1);
				//var file = new FileUtils.File(rootDir + "\content\\graphics\\Ch04_013-02.jpg");		
				Components.utils.import("resource://gre/modules/FileUtils.jsm"); 

				var file = new FileUtils.File(rootDir  + "content" +getSeperator()+ "graphics" +getSeperator() + image );					
                file.copyTo(fp.file.parent,"content" +getSeperator()+ "graphics" +getSeperator() + image );
			}
		}
		//alert("Test Paper Saved.");
	}
}

/*
* Method to create folder nested structure.
*/
function createFolderStructure(destFolder, folderStructure)
{
	 if (getOS() == 'win'){
        //var subFolders = folderStructure.split(",");
	    for (var i=0; i < folderStructure.length ; i++ )
	    {
		    destFolder.append(folderStructure[i]); 
            if ( destFolder.exists() == false ) 
			    destFolder.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_FILE); 
	    }
    }
    else
    {
//        destFolder.append(folderStructure); 
//	    if ( destFolder.exists() == false ) 
//			destFolder.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_FILE); 
    }
}

function conertHTMLToPDF(exportData, exportTchData, fileName, copyType)
{
	var rootDir = getAppRootDirectory();
	exportData = exportData.replace("overflow-x: hidden;overflow-y: auto;","").replace("overflow: auto","");
    exportTchData = exportTchData.replace("overflow-x: hidden;overflow-y: auto;","").replace("overflow: auto","");
    
    writeFile("AChrom",["content"],"Report.html",exportData);
    writeFile("AChrom",["content"],"ReportTch.html",exportTchData);

	// create an nsIFile for the executable
	var file = Components.classes["@mozilla.org/file/local;1"]
						 .createInstance(Components.interfaces.nsIFile);
	var executableFile = "wkhtmltopdf\\wkhtmltopdf.exe";

    var args = [getAppFileDirectory()+"Report.html", rootDir + "Report.pdf"];
    var args1 = [getAppFileDirectory()+"ReportTch.html", rootDir + "ReportTch.pdf"];

	if(getOS()=="mac")
	{
		executableFile = "wkhtmltopdf.app/Contents/MacOS/wkhtmltopdf";
	}
	if(getOS()=="linux32")
	{
		executableFile = "wkhtmltopdflinux/wkhtmltopdf-i386";
	}
	if(getOS()=="linux64")
	{
		executableFile = "wkhtmltopdflinux/wkhtmltopdf";
	}

	file.initWithPath(rootDir+executableFile);

	// create an nsIProcess
	var process = Components.classes["@mozilla.org/process/util;1"]
							.createInstance(Components.interfaces.nsIProcess);
	process.init(file);

	// Run the process.
	// If first param is true, calling thread will be blocked until
	// called process terminates.
	// Second and third params are used to pass command-line arguments
	// to the process.
    if (copyType == "Student" || copyType == "Both")
	    process.run(true, args, args.length);

    if (copyType == "Teacher" || copyType == "Both")
	    process.run(true, args1, args1.length);

    // Open save file dialog to save the files.
 	var fl = null;
	var nsIFilePicker = Components.interfaces.nsIFilePicker;

	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.appendFilter("Document files", "*.pdf");
	fp.init(window, "Save As", nsIFilePicker.modeSave); // modeSave // modeGetFolder
    fp.defaultString = fileName;

	var res = fp.show();
	if (res != nsIFilePicker.returnCancel)
	{
		var thefile = fp.file;
		var fileName = "";
        var teacherFileName = "";
        
        fileName = thefile.path;
		if (fileName.indexOf(".pdf") > 0)
		{
            fileName = fileName.substring(0,fileName.lastIndexOf(".pdf"));
        }

        fileName = fileName.substring(fileName.lastIndexOf(getSeperator()) + 1);
        teacherFileName = fileName + "_Teacher" + ".pdf";
  		fileName = fileName + ".pdf";
       
        if (copyType == "Student" || copyType == "Both")
        {
            Components.utils.import("resource://gre/modules/FileUtils.jsm"); 
            var file = new FileUtils.File(rootDir  + "Report.pdf" );		
            file.copyTo(fp.file.parent, fileName);
        }
       
        if (copyType == "Teacher" || copyType == "Both")
        {
            if (copyType == "Teacher")
                teacherFileName = fileName;

            Components.utils.import("resource://gre/modules/FileUtils.jsm"); 
            var file = new FileUtils.File(rootDir  + "ReportTch.pdf" );		
            file.copyTo(fp.file.parent, teacherFileName);
        }
    }
}

function loadListener(ev)
{
	doc = ev.originalTarget; 
	if (doc && doc.addEventListener)
	{
		doc.addEventListener("closeApplicaiton", closeApp, false);
		doc.addEventListener("exportToPDF", exportHTMLToPDF, false);
		doc.addEventListener("exportToDOC", exportHTMLToDoc, false);
		doc.addEventListener("exportRecentTest", saveRecentTest, false);
		doc.addEventListener("uploadSchoolLogo", uploadLogo, false);
	} 
	var browser = document.getElementById("browser");
	browser.removeEventListener("load", loadListener, true);
	
}

/**
* Function to close the application
**/
function closeApp(ev)
{
    window.close();
}

/**
 * Method to handle uploadLogo event,
 * it will copy the uploaded logo from one location to content folder.
 */
function uploadLogo(ev)
{
    // To open Oppen dialog box.
	var fl = null;
	var nsIFilePicker = Components.interfaces.nsIFilePicker;

	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Select a image", nsIFilePicker.modeOpen); // modeSave // modeGetFolder
//    fp.appendFilters(nsIFilePicker.filterImages);
    fp.appendFilter("Image Files","*.jpg; *.jpeg");

	var res = fp.show();
	if (res != nsIFilePicker.returnCancel)
	{
		var thefilePath = fp.file.path;
		var image_type_allowed = ["jpg","jpeg"];
		var image_name = thefilePath.substr(thefilePath.lastIndexOf(getSeperator())+1);
		var image_name_type = image_name.split(".");
		image_name_type_index = image_type_allowed.indexOf(image_name_type[1]);

		if(image_name_type_index == -1)
		{
			//errorMsg = "Please select a (jpg or jpeg) image.";
             logoUploaded("xulerror");
		}
		else{
		     var image = "";
		    //Code to copy image
		    if (thefilePath != null && thefilePath != "")
		    {
                Components.utils.import("resource://gre/modules/FileUtils.jsm"); 
                var rootDir = getAppRootDirectory();
                image = thefilePath.substr(thefilePath.lastIndexOf(getSeperator())+1);

                Components.utils.import("resource://gre/modules/FileUtils.jsm"); 
                var file = new FileUtils.File(thefilePath);		

                //var destinationfile = FileUtils.getFile("AChrom", ['content','content','recenttests','images'], true);								
                var destinationfile = FileUtils.getFile("AChrom", ['content', 'content','graphics'], true);								
                destinationfile.initWithPath(destinationfile.path);
                file.copyTo(destinationfile,null);

                logoUploaded(image);
		    }
		}
	}
  }

  /*
  / Method to invoke "uploadSuccess" event of main html document to share uploaded file name.
  */
  function logoUploaded(fileName)
  {
    try {       
            var ev = document.createEvent("CustomEvent");
            ev.initCustomEvent("uploadSuccess", true, true, fileName);
            doc.dispatchEvent(ev);
        } catch (ex) {
            alert("Upload logo Failed.");
        }
  }

/*
	Method to silently save the test json file in "content\content\recenttests\" folder;
*/
function saveRecentTest(ev)
{
	var exportData = ev.detail.exportData;
	//var fileName = ev.detail.fileName;

    loadRecentTestList();
    objTest = null; //new Object();
  
    if (objRecentTestList.tests.length > 0)
    {
        for(var i=0; i < objRecentTestList.tests.length; i++)
        {
            if (objRecentTestList.tests[i].test_nm == ev.detail.fileName)
              { 
              	//alert("yes");
                objTest = objRecentTestList.tests[i];
               }
        }
        if (objTest == null)
        {
            objTest = new Object;
            objTest.test_id = objRecentTestList.tests[objRecentTestList.tests.length - 1].test_id + 1;
            objRecentTestList.tests.push(objTest);
        }
    }
    else
    {
        objTest = new Object;
        objTest.test_id = 1;
        objRecentTestList.tests.push(objTest);
    }
    
    objTest.test_nm = ev.detail.fileName;
    objTest.test_fn = objTest.test_id + ".json";
    
    if (objRecentTestList.tests.length > 5 ) {
        objRecentTestList.tests.shift();
    }

    var fileName = objTest.test_fn;
   // alert(fileName);
    
    writeFile("AChrom", ['content','content','recenttests'], fileName, exportData);

    var recentListData = JSON.stringify(objRecentTestList);
    writeFile("AChrom", ['content','content','recenttests'], "recenttests.json", recentListData);

    doc.removeEventListener("exportRecentTest", saveRecentTest, true);
}


function exportHTMLToDoc(ev)
{
	var fileName = ev.detail.fileName;
    var exportData = ev.detail.exportData;
    var exportTchData = ev.detail.exportTchData;
	var imageData = ev.detail.imageData;
    var copyType = ev.detail.copyType;

    var tempData ="<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><meta charset='UTF-8'><head></head><body>";
	var tempTchData ="<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><meta charset='UTF-8'><head></head><body>";
    
    if(getOS()=="mac")
    {        
        tempData += exportData.replace(new RegExp('content/graphics/', 'g'), 'content:graphics:');
    	tempTchData +=exportTchData.replace(new RegExp('content/graphics/', 'g'), 'content:graphics:');
    }
	else
    {       
        tempData +=exportData;
    	tempTchData +=exportTchData;
    }

    tempData +="</body></html>";
	tempTchData +="</body></html>";

    convertHTMLToDoc(tempData,tempTchData, imageData, fileName, copyType);
	doc.removeEventListener("exportToDOC", exportHTMLToDoc, true);
}

function exportHTMLToPDF(ev)
{
	var fileName = ev.detail.fileName;
    var exportData = ev.detail.exportData;
    var exportTchData = ev.detail.exportTchData;
    var copyType = ev.detail.copyType;

	var tempData ="<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body>";
	tempData +="<div id=\"studentTestReport\" class=\"studentTestReport\" style=\"display: block;\">";
	tempData +=exportData;
	tempData +="</body></html>";

   var tempTchData ="<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body>";
	tempTchData +="<div id=\"studentTestReport\" class=\"studentTestReport\" style=\"display: block;\">";
	tempTchData +=exportTchData;
	tempTchData +="</body></html>";

	conertHTMLToPDF(tempData, tempTchData,  fileName, copyType );
	doc.removeEventListener("exportToPDF", exportHTMLToPDF, true);	
}

/*
 Method to load recently saved test list from json file, using a ajax call.
 */
function loadRecentTestList() {
    var recentTests = readFile("AChrom", ['content','content','recenttests'],'recenttests.json');
    objRecentTestList = JSON.parse(recentTests);
}

/**
 * Get OS information that, is it windows or mac or linux
 **/
function getOS()
{
	//return Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
	var result = Components.classes["@mozilla.org/network/protocol;1?name=http"].getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

	if (result.toLowerCase().indexOf("linux")>-1)
	{
    	if (result.toLowerCase().indexOf("i686")>-1 || result.toLowerCase().indexOf("i386")>-1 )
		{
            return "linux32";
        }
        else
		{
            return "linux64";
        }
	}
	else if (result.toLowerCase().indexOf("mac")>-1)
	{
		return "mac";
	}
	else
	{
		return "win";
	}
}

function onload() {
	var urlbar = document.getElementById("urlbar");
	var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	observerService.notifyObservers(window.arguments[0], "commandline-args-changed", null); 
	urlbar.value = getAppDirectory(); 
    listener = new WebProgressListener();
	var browser = document.getElementById("browser");
	browser.addEventListener("load", loadListener, true);
	browser.addProgressListener(listener,Components.interfaces.nsIWebProgress.NOTIFY_ALL);
	go();
}
var observer = new CommandLineObserver();  
addEventListener("load", onload, false);


