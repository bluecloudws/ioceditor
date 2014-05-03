/**
 * Constants used by an IOC node
 * TODO Some are not used and must be removed
 */

var OR_TYPE="OR";
var OR_TYPE_DISPLAY="Or";
var AND_TYPE="AND";
var AND_TYPE_DISPLAY="And";
var ITEM_TYPE="item";
var DEFAULT_TYPE="default";

var INDICATOR_ITEM="IndicatorItem";
var INDICATOR="Indicator";
var CONTAINS="contains";

/**
 * A node in the IOC tree
 */
function iocNode() 
{
}

iocNode.prototype.setIndicator = function(nodetype,nodetext)
{
	this.iocelementtext=nodetext;
	this.iocelement=INDICATOR; 
	this.iocoperator=nodetype; 
	this.text=nodetext;
	this.type=nodetype;	
};

iocNode.prototype.setIndicatorItem = function(iocdocument,iocdocumentitem,iocdocumentitemDisplay,nodetype,nodetext)
{
	this.ioccondition="contains"; 				
	this.iocelementtype="string";
	this.iocelementtext="";
	this.iocdocument=iocdocument;
	this.iocdocumentitem=iocdocumentitem;
	this.iocdocumentitemdisplay=iocdocumentitemDisplay; 
	this.iocelement=INDICATOR_ITEM; 
	this.iocsearch=iocdocument + '/' + iocdocumentitem; 
	this.iocoperator=""; 
	this.text=nodetext;
	this.value=0;
	this.type=nodetype;	

};

iocNode.prototype.isIndicator = function()
{
	if (this.iocelement == null || this.iocelement.length ==0)
		return false;
	else if (!this.iocelement.localeCompare(INDICATOR))
		return true;
	else
		return false;
};

iocNode.prototype.ioccondition=""; 				// IndicatorItem condition= : contains | contains not | is | is not
iocNode.prototype.iocelementtype=""; 			// Content type= : string | MD5 | IP | Number
iocNode.prototype.iocelementtext="";			// Actual value
iocNode.prototype.iocdocument=""; 				// Context document= : e.g. ArpEntryItem
iocNode.prototype.iocdocumentitem=""; 			// Context search= : e.g. VolumeName
iocNode.prototype.iocdocumentitemdisplay=""; 	// Context search= : e.g. Volume Name
iocNode.prototype.iocelement=""; 				// Indicator | IndicatorItem
iocNode.prototype.iocsearch=""; 				// Context search= : e.g. ArpEntryItem/IPv4Address
iocNode.prototype.iocoperator=""; 				// Indicator operator= : AND | OR
iocNode.prototype.text="";						// Internal Only : e.g. RegistryValue is 0x00000000
iocNode.prototype.value=0;						// Actual value
iocNode.prototype.type="";						// Internal Only : AND | OR | item

/**
 * A map of IOC's
 * TODO, this is not a tree, need to rename
 */
function iocTree()
{
}

iocTree.prototype.map={};

/**
 * Put a node in the map at the given key
 * @param key
 * @param value
 */
iocTree.prototype.put = function (key,value) {
	
	this.map[key] = value;
};

/**
 * Get a node from the map at the given key
 * @param key
 * @returns
 */
iocTree.prototype.get = function (key) {
	
	return this.map[key];
};

/**
 * Delete the node from the map at the given key
 * @param key
 */
iocTree.prototype.remove = function (key) {
	delete this.map[key];
};

/**
 * The IOC, consisting of the map of nodes and other descriptive information
 */
function IOC()
{
	this.iocTree = new iocTree();
}

IOC.prototype.iocTree=null;
IOC.prototype.id=null;
IOC.prototype.shortDescription=null;
IOC.prototype.description=null;
IOC.prototype.keywords=null;
IOC.prototype.authoredby=null;
IOC.prototype.authoreddate=null;
IOC.prototype.authoreddate=null;


function delete_ioc(ioc)
{
	if(ioc == null)
		return;
	
	if(ioc.iocTree != null)
		delete ioc.iocTree;
	
	delete ioc;
}
