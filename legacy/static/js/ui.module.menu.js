(function(UI){

    UI.module.menu = function(selector) {
        return new Menu(selector);
    };
    
    function Menu(sel) {
        var self = this,
            inbox_btn = this.inbox_btn = $(sel + ' .mod-account .inbox'),
            inbox_list = this.inbox_list = $(sel + ' .mod-account .inbox-list'),
            inbox_msgs = this.inbox_msgs = $(sel + ' .mod-account span.messages'),
            inbox_controls = this.inbox_menu = $(sel + ' .mod-account .controls'),
            profile = this.profile = $(sel + ' .mod-account a.profile'),
            account_btn = this.account_btn = $(sel + ' .mod-account a.account'),
            account_menu = this.account_menu = $(sel + ' .mod-account .account-menu');
        
        account_btn.bind('click', function(e){
            self.inboxBtnOff();
            if (!account_btn.hasClass('on')) {
                e.stopPropagation();
                self.accountBtnOn();
            }
        });
        account_menu.bind('click', function(e){
            e.stopPropagation(); 
        });
        $(document).bind('click', function(){
            self.accountBtnOff();
            self.inboxBtnOff();
        });
        $.defaultText({
            context: sel
        });
        
        /* inbox click bind
        ----------------------------*/
        inbox_btn.bind('click', function(e){
            self.accountBtnOff();
            if ( !inbox_btn.hasClass('on') ) {
                e.stopPropagation();
                self.inboxBtnOn();
            }
        });
        inbox_controls.bind('click', function(e){
            e.stopPropagation(); 
        });
        $('#clear-inbox-alerts').bind('click',function(){
            self.clearInboxAlerts();
        });
        
        this.fillInbox = function(topics) {
            var self = this,
                len = topics.length,
                html = [];
            for (var i=0; i < len; i++) {
                html[i] = '<a href="/feed/topic/'+topics[i]._id+'">' + topics[i].comment + '</a>';
            }
            html = html.join('');
            inbox_list.find('.messages').html( html );
        };

    }
    
    Menu.prototype.accountBtnOn = function(){
        this.account_btn.addClass('on');
        this.account_menu.addClass('on');
    };
    
    Menu.prototype.accountBtnOff = function(){
        this.account_btn.removeClass('on');
        this.account_menu.removeClass('on');
    };
    
    Menu.prototype.inboxBtnOn = function(){
        var self = this;
        UI.ajax({
            url: '/api/member/topics',
            data: {
                type: 'alerts',
                skip: 0,
                limit: 25
            },
            success: function(data) {
                if (!data.topics || data.topics.length === 0) return;
                self.fillInbox(data.topics);
                self.inbox_btn.addClass('on');
                self.inbox_list.addClass('on');
            }
        }); 
    };
    
    Menu.prototype.clearInboxAlerts = function(){
        var self = this;
        UI.ajax({
            url: '/api/member/topics',
            type: 'POST',
            data: {
                action: 'remove',
                topics: 'all'
            },
            success: function(data) {
                self.inbox_btn.removeClass('on new');
                self.inbox_list.removeClass('on');
                self.inbox_msgs.text('0');
            } 
        });
    };
    
    Menu.prototype.inboxBtnOff = function(){
        this.inbox_btn.removeClass('on');
        this.inbox_list.removeClass('on');
    };

})(UI);