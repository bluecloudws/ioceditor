
/*
 * The map of IOC nodes
 */
var iocTreeMap = null;
var this_ioc = null;

/**
 * Clear all nodes in the tree and create a new root Or Indicator node
 */
function clear_all()
{
	// Destroy the tree
	$('#ioc_tree').empty().jstree('destroy');
	 
	// and reinitialize
	ioc_initialize();

}

/**
 * Handler for Save action when editing  a node.  Called from the Edit Modal Dialog
 */
function save_node_edit()
{
	var node = iocTreeMap.get($('#nodeid').val());

	var tree = $('#ioc_tree').jstree(true);
	sel = tree.get_selected();
	
	if( node != null && sel != null )
	{
		node.iocelementtext = $('#editElementValue').val();
		node.iocelementtype = $('#editItemtype').val();
		node.ioccondition = $('#editCondition').val();
		
		var jstree_node = tree.get_node(sel);
		bind_rename(false);
		tree.rename_node(jstree_node, node.iocdocumentitemdisplay + ' ' + node.ioccondition + ' ' + node.iocelementtext);
		bind_rename(true);
		
	}
	
	$('#updatedialog').modal('hide');
}

/**
 * Context menu for Delete and Edit
 */
function contextmenu_items() 
{ 
	
	var context_items = {
		"edit" : {
			"separator_before"	: false,
			"separator_after"	: false,
			"_disabled"			: false, //(this.check("rename_node", data.reference, this.get_parent(data.reference), "")),
			"label"				: "Edit",
			"action"			: function (data) {
				
				var inst = $.jstree.reference(data.reference);
				obj = inst.get_node(data.reference);
				
				var node = iocTreeMap.get(obj.id);
				
				if(node != null)
				{
					$('#editElementName').val(node.iocdocumentitemdisplay);
					$('#editElementValue').val(node.iocelementtext);
					$('#editItemtype').val(node.iocelementtype);
					$('#editCondition').val(node.ioccondition);
					$('#nodeid').val(obj.id);
				}
				
				$('#updatedialog').modal({show:true,backdrop:'static'});				

				/*
				inst.edit(obj);
				*/
			}
		},
		"remove" : {
			"separator_before"	: false,
			"icon"				: false,
			"separator_after"	: false,
			"_disabled"			: false, //(this.check("delete_node", data.reference, this.get_parent(data.reference), "")),
			"label"				: "Delete",
			"action"			: function (data) {
				var inst = $.jstree.reference(data.reference),
				obj = inst.get_node(data.reference);
				var node = iocTreeMap.get(obj.id);
				
				if(inst.is_selected(obj)) {
					inst.delete_node(inst.get_selected());
					iocTreeMap.remove(obj.id);
					//TODO Remove children nodes also
				}
				else {
					inst.delete_node(obj);
					iocTreeMap.remove(obj.id);
					//TODO Remove children nodes also
				}
				
				// If it's the root, then delete the entire tree map
				if(obj.parent === "#")
				{
					delete iocTreeMap;
					iocTreeMap = new iocTree();
				}
			}
		},
		/*"ccp" : {
			"separator_before"	: true,
			"icon"				: false,
			"separator_after"	: false,
			"label"				: "Move",
			"action"			: false,
			"submenu" : {
				"cut" : {
					"separator_before"	: false,
					"separator_after"	: false,
					"label"				: "Cut",
					"action"			: function (data) {
						var inst = $.jstree.reference(data.reference),
							obj = inst.get_node(data.reference);
						if(inst.is_selected(obj)) {
							inst.cut(inst.get_selected());
						}
						else {
							inst.cut(obj);
						}
					}
				},
				"copy" : {
					"separator_before"	: false,
					"icon"				: false,
					"separator_after"	: false,
					"label"				: "Copy",
					"action"			: function (data) {
						var inst = $.jstree.reference(data.reference),
							obj = inst.get_node(data.reference);
						if(inst.is_selected(obj)) {
							inst.copy(inst.get_selected());
						}
						else {
							inst.copy(obj);
						}
					}
				},
				"paste" : {
					"separator_before"	: false,
					"icon"				: false,
					"_disabled"			: !(this.can_paste()),
					"separator_after"	: false,
					"label"				: "Paste",
					"action"			: function (data) {
						var inst = $.jstree.reference(data.reference),
							obj = inst.get_node(data.reference);
						inst.paste(obj);
					}
				}
			}
		}*/
	};
	
	var ref = $('#ioc_tree').jstree(true);
	var sel = ref.get_selected();
	if(sel.length>0)
	{
		// Disallow edit of Or/And nodes
		var node = iocTreeMap.get(sel[0]);
		if(typeof node == 'undefined' || !node || node.isIndicator())
			delete context_items.edit;
		
		// Disallow removal of root node
		var parentNode = ref.get_parent(sel[0]);
		if(parentNode && !parentNode.localeCompare('#'))
			delete context_items.remove;
	}

	return context_items;
}

/**
 * Initialize the JSTree
 */
function ioc_initialize()
{
	$('#ioc_tree').append('<ul> <li data-jstree=\'{"icon":"glyphicon glyphicon-plus","opened":true,"selected":true, "type":"OR", "data":{"iocelement":"Indicator","iocoperator":"OR"}}\'>Or </li>  </ul>');

	bind_treeready();

	$('#ioc_tree').jstree({"core" : {"animation" : 0,"check_callback" : true,"themes" : {"variant" : "large"} }, "plugins" : [ "contextmenu", "unique", "dnd", "search", "state", "types", "wholerow" ], 
	    "types" : { "#" : { "state" : { "selected" : true }, "max_children" : -1, "max_depth" : 50, "icon" : "glyphicon glyphicon-tree-deciduous", "valid_children" : ["OR"] },
	    	"OR" : { "icon" : "glyphicon glyphicon-plus-sign", "valid_children" : ["OR","AND","item"] },
	    	"AND" : { "icon" : "glyphicon glyphicon-plus", "valid_children" : ["OR","AND","item"] },
	    	"item" : { "icon" : "glyphicon glyphicon-list-alt" }
	    },"contextmenu": {items:contextmenu_items}});
	
	bind_rename(true);
	
	initialize_structures();
	
	var tree = $('#ioc_tree').jstree(true);
	tree.select_all(true);

}

function initialize_structures()
{
	// Delete the tree of node data
	delete_ioc(this_ioc);

	this_ioc = new IOC();
	iocTreeMap = this_ioc.iocTree;	
}



/**
 * Create an OR Indicator operator in the tree
 */
function ioc_create_or() 
{
	ioc_create_indicator(OR_TYPE,OR_TYPE_DISPLAY,true);
}

/**
 * Create an AND Indicator operator in the tree
 */
function ioc_create_and() 
{
	ioc_create_indicator(AND_TYPE,AND_TYPE_DISPLAY,true);
}

/**
 * Create an IndicatorItem node in the tree
 */

function ioc_create_item(iocdocumentitemDisplay,iocdocument,iocdocumentitem,valuetype) 
{
	ioc_create_indicatoritem(ITEM_TYPE,iocdocumentitemDisplay,iocdocument,iocdocumentitem, null, null,valuetype,true);
}

/**
 * Create an Indicator node in the tree
 * @param nodetype
 * @param nodetext
 * @returns {Boolean}
 */
function ioc_create_indicator(nodetype,nodetext,selectnode) 
{
	var ref = $('#ioc_tree').jstree(true);
	sel = ref.get_selected();
	if(!sel.length) { return false; }
	sel = sel[0];

	var newnode = ref.create_node(sel, {text:nodetext,type:nodetype});
	if(newnode)
	{
		if(selectnode==true)
		{
			ref.deselect_node(sel);
			ref.select_node(newnode);
		}
	
		var node = new iocNode();
		node.setIndicator(nodetype,nodetext);
		
		iocTreeMap.put(sel,node);
	}
}

/**
 * Create an IndicatorItem node in the tree
 * @param nodetype
 * @param striocdocument
 * @param striocdocumentitem
 * @returns {Object}
 */
function ioc_create_indicatoritem(nodetype,striocdocumentitemDisplay,striocdocument,striocdocumentitem,condition,value,valuetype,editnode) 
{
	var ref = $('#ioc_tree').jstree(true);
	var sel = ref.get_selected();
	if(!sel.length) { return null; }
	sel = sel[0];
	
	var nodevalue; 
	if(value == null)
		nodevalue = 'Enter new value';
	else
		nodevalue = striocdocumentitemDisplay + ' ' + condition + ' ' + value;
	
	var newnode = ref.create_node(sel, {text:nodevalue,type:nodetype});
	
	if(newnode) 
	{
		var node = new iocNode();
		node.setIndicatorItem(striocdocument,striocdocumentitem,striocdocumentitemDisplay,nodetype,nodevalue);	
		
		if (valuetype != null)
			node.iocelementtype = valuetype;
		
		iocTreeMap.put(newnode,node);

		if(editnode == true)
			ref.edit(newnode);
		
		return node;
	}
	else
		return null;
}

function ioc_rename() 
{
	var ref = $('#ioc_tree').jstree(true);
	sel = ref.get_selected();
	if(!sel.length) { return false; }
	sel = sel[0];
	ref.edit(sel);
}

function ioc_delete() 
{
	var ref = $('#ioc_tree').jstree(true);
	sel = ref.get_selected();
	if(!sel.length) { return false; }
	ref.delete_node(sel);
}

function selected_node()
{
	var ref = $('#ioc_tree').jstree(true);
	sel = ref.get_selected();
	if(!sel.length) 
	{ 
		return null; 
	}
	else
		return sel[0];

}

function deselect_andselect_newnode(newnodesel)
{
	if(!newnodesel)
		return;
	
	var ref = $('#ioc_tree').jstree(true);
	sel = ref.get_selected();
	if(sel.length>0) 
	{ 
		ref.deselect_node(sel[0]) ;
		ref.select_node(newnodesel);
	}

}

function TreeNode_JsonOptions()
{
	this.no_data = false;
	this.no_children = false;
	this.no_state = true;
	this.no_id = false;
	this.flat = false;
}

/**
 * Get the IOC tree data as JSON
 * @returns
 */
function get_tree_data()
{
	var tree = $('#ioc_tree').jstree(true);
	if(tree == null)
		return null;
	
	var container = tree.get_container();	
	if(container == null)
		return null;
	
	var options = new TreeNode_JsonOptions();
	
	var jsondata = tree.get_json(container, options);
	
	return(jsondata);
}

/**
 * Save the IOC tree content as XML
 * @returns
 */
function save_xml()
{
	$('#iocxml').val("");
	
	var jsondata = get_tree_data();
	// TODO Have to call twice to get refreshed data ????
	jsondata = get_tree_data();
	
	if(jsondata == null)
	{
		alert("IOC Tree is empty");
		
	}
	else
	{
		var jsonstr = JSON.stringify(jsondata,
				["data","text","type","id","children"]);
		
		var jsonobj = JSON.parse(jsonstr);
		
		$('#iocxml').val(convert_to_xml(jsonobj));
		
		save_to_localfile();
	}
}

/**
 * Save the XML of the IOC tree to a local file
 */
function save_to_localfile()
{
	var blob = new Blob([$('#iocxml').val()], {'type':'application\/octet-stream'});
	
	var filename = $("#author").val();
	
	if(filename)
		filename = filename + '.ioc';
	else
		filename = 'New-Indicator.ioc';
	
	if(window.navigator.msSaveOrOpenBlob)
	{
		window.navigator.msSaveOrOpenBlob(blob, filename);
	}
	else
	{
		window.URL = window.URL || window.webkitURL;

		$("#savexml").attr('href',window.URL.createObjectURL(blob));
		$("#savexml").attr('download',filename);
				
		$("#savexml").get(0).click();
		
	}
}

/**
 * Entry method to begin converting the IOC tree (in JSON) to XML
 * @param jsonobj
 * @returns
 */
function convert_to_xml(jsonobj)
{
	if(jsonobj == null)
		return null;
	
	return( create_iocxml(jsonobj) );
		
}

/**
 * Create a unique id for the IOC element
 */
function create_id()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    
}

function get_current_date()
{
	var today = new Date();
	
	return (today) ;
}

/**
 * Recurse through the tree to get the Indicator and IndicatorItem elements
 * @param indicatoritems_intree
 * @returns
 */
function create_indicatoritems_inxml(indicatoritems, items_intree)
{
	if ( items_intree == null || indicatoritems == null)
		return null;

	for(var i=0;i<items_intree.length;i++)
	{
		var nodetype = items_intree[i].type;
		var text = items_intree[i].text;
		var node = iocTreeMap.get(items_intree[i].id); 
				
		if( nodetype === OR_TYPE || nodetype === AND_TYPE )
		{
			if ( indicatoritems.Indicator === undefined )
				indicatoritems.Indicator = [];
			
			var new_indicator = { _operator : nodetype, _id : create_id() };
			indicatoritems.Indicator.push( new_indicator  );

			//console.log('nodetype is operator: ' + nodetype);

			if(items_intree[i].children != null)
			{
				create_indicatoritems_inxml( new_indicator, items_intree[i].children );
			}
		}
		else if( nodetype === ITEM_TYPE )
		{
			var new_text = node.iocelementtext;
			
			if ( indicatoritems.IndicatorItem === undefined )
				indicatoritems.IndicatorItem = [];
			
			indicatoritems.IndicatorItem.push( {_condition : node.ioccondition, _id : create_id(), 	
					'Context' : { _document:node.iocdocument, _search:node.iocsearch, _type:'mir' }, 
						'Content' : {_type : node.iocelementtype, "__text" : new_text} } );
			
			//console.log('nodetype is item: ' + new_text);
		}
		else
		{
			//console.log('nodetype is wrong: ' + nodetype + ' ' + text);
		}
				
	}
		
}

/**
 * Create the IOC XML Schema compliant xml from a JSON object
 * @param jsonobj
 * @returns
 */
function create_iocxml(jsonobj)
{
	// Get fields from the form
	var author = $('#author').val();
	var description = $('#description').val();

	// Create the static portion of the IOC xml
	var ioc_json = {};
	var ioc_header = {};
	var ioc_definition = {};
	
	ioc_definition.Indicator = {_operator : OR_TYPE, _id : create_id()} ;

	var x2js = new X2JS({escapeMode : false });	
	var today_inxml = x2js.toXmlDateTime( get_current_date() );
	
	ioc_header = 
	{
		"_xmlns:xsi" : "http://www.w3.org/2001/XMLSchema-instance", "_xmlns:xsd" : "http://www.w3.org/2001/XMLSchema",
		"_xmlns" : "http://schemas.mandiant.com/2010/ioc", _id : create_id() , '_last-modified' : today_inxml,
		short_description : description, "description" : description, authored_by : author,
		authored_date : today_inxml, links : null , definition : ioc_definition
	};	
	
	ioc_json.ioc = ioc_header;
	
	// Create the Indicator and IndicatorItems
	create_indicatoritems_inxml(ioc_definition.Indicator, jsonobj[0].children);	

	// generate XML
	var convertedxml = x2js.json2xml_str(ioc_json);
	
	return vkbeautify.xml( convertedxml );

}

/**
 * Load and IOC from XML and generate the IOC Tree
 */
function load_xml()
{
	var xml_text = $('#iocxml').val();
	
	clear_all();
			
	var x2js = new X2JS({escapeMode : false });
	var json_obj = x2js.xml_str2json(xml_text);
	
	if(json_obj == null || json_obj.ioc == null || json_obj.ioc.definition == null)
	{
		// TODO Alert, null tree
		return;		
	}
	
	this_ioc.id = json_obj.ioc._id;
	this_ioc.description = json_obj.ioc.description;
	this_ioc.shortDescription = json_obj.ioc.short_description;
	this_ioc.authoredby = json_obj.ioc.authored_by;
	this_ioc.authoreddate = json_obj.ioc.authored_date;
	
	$('#author').val(this_ioc.authoredby);
	if(this_ioc.description)
		$('#description').val(this_ioc.description);
	else if(this_ioc.shortDescription)
		$('#description').val(this_ioc.shortDescription);
	
	var indicator = json_obj.ioc.definition.Indicator;
	
	if( indicator == null )
	{
		// TODO Alert, empty tree
		return;
	}
	
	var tree = $('#ioc_tree').jstree(true);
	tree.select_all(true);
	
	ioc_create_tree(indicator,true);
}

/**
 * Given a hiearchy of Indicator node, traverse and create the Indicator, and is children Indicator nodes and Indicator Item nodes
 * @param indicatorInput
 * @param dontcreate - Don't create if it's the root Or Indicator, since that exists by default
 */
function ioc_create_tree(indicatorInput,dontcreate)
{
	var indicator = indicatorInput;
	
	if(!(indicator instanceof Array))
		indicator = [indicatorInput];
	
	var parent_selected_node = selected_node();
	
	for(var i=0;i<indicator.length;i++)
	{

		if(i>0)
			deselect_andselect_newnode(parent_selected_node);
		
		/*
		console.log(indicator[i]._id);
		console.log(indicator[i]._operator);
		*/
		if(!dontcreate)
			ioc_create_indicator(indicator[i]._operator,indicator[i]._operator,true);
		
		if(indicator[i].IndicatorItem != null)
		{
			var indicatoritem = indicator[i].IndicatorItem;
			
			if(!(indicatoritem instanceof Array))
				indicatoritem = [indicator[i].IndicatorItem];
			
			for(var j=0;j<indicatoritem.length;j++)
			{
				var this_indicatoritem = indicatoritem[j];
				/*
				console.log(this_indicatoritem._condition);
				console.log(this_indicatoritem._id);
				console.log(this_indicatoritem.Content.__text);
				console.log(this_indicatoritem.Content._type);
				console.log(this_indicatoritem.Context._document);
				console.log(this_indicatoritem.Context._type);
				console.log(this_indicatoritem.Context._search);
				*/
							
				var new_indicatoritem = ioc_create_indicatoritem(ITEM_TYPE,ioc_text_to_title_map[this_indicatoritem.Context._search],this_indicatoritem.Context._document,this_indicatoritem.Context._search, this_indicatoritem._condition, this_indicatoritem.Content.__text, this_indicatoritem.Content._type, false);
			
				// TODO Refactor this 
				new_indicatoritem.ioccondition = this_indicatoritem._condition;
				new_indicatoritem.iocelementtext = this_indicatoritem.Content.__text;
				new_indicatoritem.iocelementtype = this_indicatoritem.Content._type;
				// TODO
			}
		}
		
		if(indicator[i].Indicator != null)
			ioc_create_tree(indicator[i].Indicator,false);
		
	}
}
