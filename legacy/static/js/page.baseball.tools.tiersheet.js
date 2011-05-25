UI.module('baseball.tools.tiersheet', function(){
    
    var init = function _init() {
        
        var c = new Tier('c'),
            b1 = new Tier('b1'),
            b2 = new Tier('b2'),
            b3 = new Tier('b3'),
            ss = new Tier('ss'),
            lf = new Tier('lf'),
            rf = new Tier('rf'),
            cf = new Tier('cf'),
            of = new Tier('of'),
            sp = new Tier('sp'),
            rp = new Tier('rp');
        
        $.defaultText({
            context: '#save-box',
            clearEvents:[
                {selector: '#save-tiersheet', type:'click'}
            ]
        });
        
        $('.sheet li').bind('dblclick', function(){
            var id = $(this).attr('rel');
            if ( $(this).hasClass('picked') ) {
                $('[rel='+id+']').removeClass('picked');
            } else {
                $('[rel='+id+']').addClass('picked');
            }
        });
        
        $('#save-tiersheet').bind('click', function(){
            saveTiersheet();
        });
        $('#save-box input').bind('keypress', function(e){
            var code = e.keyCode || e.which;
            if (code === 13) {
                $('#save-tiersheet').trigger('click');
            }
        });
        $('#sent-close').bind('click',function(){
            $('#sent-box').hide();
            $('#save-box').show();
        });
  
        $('#sp li[rel="4d6131bddc542f1519000196"]').hide();

        function saveTiersheet() {

            var tiersheet = {
                    name: $('#name').val(),
                    email: $('#email').val(),
                    draft_type: $('#draft-type > option:selected').val(),
                    c: $.toJSON( c.getJSON() ),
                    b1: $.toJSON( b1.getJSON() ),
                    b2: $.toJSON( b2.getJSON() ),
                    b3: $.toJSON( b3.getJSON() ),
		    ss: $.toJSON( ss.getJSON() ),
                    lf: $.toJSON( lf.getJSON() ),
                    rf: $.toJSON( rf.getJSON() ),
                    cf: $.toJSON( cf.getJSON() ),
		    of: $.toJSON( of.getJSON() ),
                    sp: $.toJSON( sp.getJSON() ),
                    rp: $.toJSON( rp.getJSON() )
                };
            
            UI.ajax({
                url: '/baseball/tools/tiersheet/save',
                type: 'POST',
                data: tiersheet,
                beforeSend: function() {
                    $('#error-box').hide().html('');
                },
                error: function( num, html ) {
                    $('#error-box').show().html( html );  
                },
                success: function(data) {
                    var tiersheet = data.tiersheet;
                    $('#save-box').hide();
                    $('#sent-box').show();
                    var msg = 'We sent your permanent tiersheet link to <strong>' + tiersheet.email + '</strong>.<br>\
                                  Check your <strong>junkmail</strong> folder if you didn\'t receive it.';
                    $('#sent-msg').html( msg );
                }
            });
            
        }
        
        $('a.tierset-link').bind('click',function(){
            var level = this.id.replace('tierset-link-','');
            $('a.tierset-link').removeClass('on');
            $(this).addClass('on');
            showTierset( level );
        });
        
        $('#print').bind('click',function(){
            window.print(); 
        });
        
        $('#logo, #beta-button').bind('click', function(){
            location.href = '/';
        });
        
        
        function showTierset( level ) {
            $('.tierset').css({visibility:'hidden'});
            $('#tierset-' + level).css({ visibility: 'visible', display: 'block', position:'absolute' });
        }
        
        showTierset(1);
        
    }();
    
    function Tier( position ) {
        
        var sel = '#' + position,
            marker_distance = 25,
            sort_options = {
                axis: 'y',
                items: 'li',
                containment: 'document',
                revert: true,
                scrollSpeed: 40,
                update: updateTierSheet
            },
            drag_options = {
                axis: 'y',
                grid: [0, marker_distance],
                start: markerDragStart,
                stop: markerDragStop
            },
            players = $(sel + ' ol'),
            tier_markers = $(sel + ' .marker > div'),
            max_tiers = tier_markers.size(),
            marker_top_min = players.find('li').first().offset().top,
            marker_top_max = players.find('li').last().offset().top,
            marker_indexes = [];
                    
        players.sortable( sort_options ).disableSelection();
        tier_markers.bind('mousedown', setMarkerContainment).draggable( drag_options );
        
        /*  update the tiersheet after drop
        -------------------------------------------------*/
        function updateTierSheet(e){
            var player = $(e.originalEvent.target).closest('li').addClass('on');
            player.effect('highlight', function(){
               player.removeClass('on');
            });
        }
        
        /*  begin dragging tier marker
            determine marker offset (min & max)
            drag start
            drag stop
        -------------------------------------------------*/
        function setMarkerContainment(e){
            var marker = $(e.target).closest('div'),
                index = marker.index(),
                top_min = index <= 0 ? marker_top_min : $(tier_markers[ index - 1 ]).offset().top + marker_distance,
                top_max = index >= max_tiers - 1 ? marker_top_max : $(tier_markers[ index + 1 ]).offset().top - marker_distance;
            if (index <= 0) top_max = top_min;
            tier_markers.draggable( "option", "containment", [0, top_min, 0, top_max] );
        }
        function markerDragStart(e) {
            $(e.target).addClass('on');
        }
        function markerDragStop(e) {
            marker_indexes = [];
            $.each(tier_markers, function(i, marker) {
                var top = $(marker).position().top,
                    this_top = top <= 0 ? 0 : top,
                    index = this_top / marker_distance;
                marker_indexes.push( index ); // create the marker index array
            });
            $(e.target).removeClass('on');
        }
        
        /*  set initial markers
        -------------------------------------------------*/
        var initMarkers = function() {
            var tier_starters = players.find('li.begin-tier');
            marker_indexes = [];
            $.each(tier_starters, function(i) {
                var top = $(tier_starters[i]).position().top,
                    this_top = top <= 0 ? 0 : top,
                    index = this_top / marker_distance;
                $(tier_markers[i]).css({top:this_top}); // position them
                marker_indexes.push( index ); // create the marker index array
            });
            tier_markers.show();
        }();
        
        this.getJSON = function() {
            var players = $(sel + ' ol > li'),
                player_ids = [],
                total_markers = tier_markers.length;
            
            $.each(marker_indexes, function(i, index){

                var next_index = i < total_markers-1 ? $(tier_markers[i+1]).position().top / marker_distance : players.length;
                
                player_ids.push([]);
		index = Math.round(index);
                
                for (var j=index; j < next_index; j+=1) {
                    player_ids[i].push( $(players[j]).attr('rel') );
                }

            });
            return player_ids;
        };
    }
    
    
});

