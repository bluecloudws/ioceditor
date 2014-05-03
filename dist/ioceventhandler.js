

/**
 * After the tree has been created, bind other interesting event handlers to it
 */
function bind_treeready()
{
	$( "#ioc_tree" ).bind( "ready.jstree", function(event,data ) {
	    console.log('IOC Tree is ready');
	    
	    bind_nodecreated();
	    bind_nodeloaded();
	    bind_treerefresh();
	    bind_nodeselected();

	});
	
}

/**
 * Event handler for a tree node selection
 */
function bind_nodeselected()
{
	$( "#ioc_tree" ).bind( "select_node.jstree", function(event,data ) {
	    //console.log(data.node);
	    
		if(data == null || data.node == null)
		{
			//console.log("bind_nodeselected encountered unexpected null");
			return;
		}

		if(data.node.type == ITEM_TYPE)
		{
			$('.indicator-btn').prop("disabled",true);

		}
		else
		{
			$('.indicator-btn').prop("disabled",false);

		}

	});
}

/**
 * Event handler for a tree refresh
 */
function bind_treerefresh()
{
	$( "#ioc_tree" ).bind( "refresh.jstree", function(event,data ) {
	    //console.log('IOC Tree was refreshed');
	});
}

/**
 * Event handler for when a node is loaded.
 * Not currently used.
 */
function bind_nodeloaded()
{
	$( "#ioc_tree" ).bind( "load_node.jstree", function(event,data ) {
	    //console.log('A node was loaded');
	});
}

/**
 * Event handler for when a node is created.
 * Not currently used.
 */

function bind_nodecreated()
{
	$( "#ioc_tree" ).bind( "create_node.jstree", function(event,data ) {
	    //console.log('Node was added to IOC tree');
	    
	    if(data != null && data.node != null)
	    {
		    //console.log(data.node.id);		    
	    }
	    
	});
}

/**
 * Bind to the rename event of the tree to control the text of a tree node
 * @param on
 */
function bind_rename(on)
{
	if(on)
	{
		$( "#ioc_tree" ).bind( "rename_node.jstree", function(event,data ) {
		    on_rename(event, data);
		});
	}
	else
	{
		$( "#ioc_tree" ).unbind("rename_node.jstree" );
	}

}


/**
 * When changing the text of a tree node, display the node name and the value
 * @param event
 * @param data
 */
function on_rename(event, data)
{
	
	if(data == null || data.node == null)
	{
		//console.log("on_rename encountered unexpected null");
		return;
	}
	
	var tree = $('#ioc_tree').jstree(true);

	bind_rename(false);
		
	var node = iocTreeMap.get(data.node.id);
	node.iocelementtext = data.node.text;
	node.text = node.iocdocumentitemdisplay + ' ' + node.ioccondition + ' ' + data.node.text;

	tree.rename_node(data.node, node.text);

	bind_rename(true);
}