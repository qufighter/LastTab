var selWindows=[];
function historyAdd(windowId,tabId){
	if( !selWindows[windowId] ){
		selWindows[windowId] = new Array(2);
		selWindows[windowId][0]=0;
		selWindows[windowId][1]=0;
	}
	if(selWindows[windowId][0]==tabId)return;
	selWindows[windowId][2]=selWindows[windowId][1];
	selWindows[windowId][1]=selWindows[windowId][0];
	selWindows[windowId][0]=tabId;
}
var currentWindow = 1;//to track which set of tabs to return to the popup.html
function setCurrentWindow(tabId,selectInfo){
	currentWindow=selectInfo.windowId;
	historyAdd(selectInfo.windowId,tabId);
}
chrome.tabs.onSelectionChanged.addListener(setCurrentWindow);
chrome.windows.onFocusChanged.addListener(function(windowId){
	chrome.tabs.getSelected(windowId,function(tab){
		setCurrentWindow(tab.id,{windowId:tab.windowId})
	})
});
function removedTab(tabId) {
	if( tabId == selWindows[currentWindow][0] ){
	setTimeout(function(){//unnecessary timeout?
		chrome.windows.getCurrent(function(window) {
			if( currentWindow==window.id ){
				if(selWindows[window.id][1]==tabId){
					chrome.tabs.update(selWindows[window.id][2],{selected:true},function(){
					})
				}
			}
		})
	},3);
	}
}
chrome.tabs.onRemoved.addListener(removedTab);
chrome.tabs.onDetached.addListener(removedTab);	
function cleanupEmptyWindows(){
	var nsw = new Array();
	for(i in selWindows){
		if( typeof(selWindows[i]) == 'object' && selWindows[i]!=null && selWindows[i].length > 0){
			nsw[i]=selWindows[i];
		}
	}
	selWindows=nsw;
}
chrome.windows.onRemoved.addListener(function(winId) {
	if( selWindows[winId] ){
		selWindows[winId]=null;
		cleanupEmptyWindows()
	}
});