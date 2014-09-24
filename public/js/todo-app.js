window.STATICS = {};

window.STATICS.keysmap= {
  ENTER: 13,
  ESC: 27
};

window.taskView = null;

window.AppView = Backbone.View.extend({
  el: $("#J_app"),
  t: null,
  events: {
    'click .side-bar li a': 'listSelect',
    'click .J_listRename': 'listRenameShow',
    'click .J_listDelete': 'listDeleteShow',
    'click .J_listAdminCancel': 'listAdminHide',
    'keypress #J_listRenameInput': 'keyboardCancel',
    'keypress #J_listDeleteBtn': 'keyboardCancel',

    'click #J_listRenameBtn': 'listUpdate',
    'click #J_listDeleteBtn': 'listDelete'
  },

  initialize: function(){
    /* global notice fadeout */
    this.t = setTimeout(function(){
      $(".flash").fadeOut("slow");
    }, 1200);

    var paramName = "list";
    var listId = new RegExp('[\?&]' + paramName+ '=([^&#]*)').exec(window.location.href);

    var list;

    if (listId) {
      listId = listId[1];
      list = $('.side-bar li[data-id=' + listId + ']');
    } else {
      var lists = $('.side-bar li');
      if (lists) {
        list = lists[0];
      }
    }

    var e = $.Event('click');
    e.target = $('a', list);
    this.listSelect(e);
  },

  listSelect: function(_event) {

    var _target = $(_event.target);
    var _id = _target.parents('.nav-item').attr('data-id');
    var _text = $(_target).text().trim();
    
    _target.parents('.nav-item').addClass('active').siblings().removeClass('active');

    if (_id != window.STATICS.currentListId) {
      window.STATICS.currentListId = _id;

      // set rename form's input
      $('#J_listRenameInput').attr('value', _text);

      this.listAdminHide();

      if (window.taskView) {
        window.taskView.undelegateEvents();
        window.taskView = new window.TaskView();
      }
    }

    _event.preventDefault();
    //_event.stopPropagation();
  },

  listRenameShow: function(_event) {
    this.listAdminHide();
    $('#J_listRenameForm').fadeToggle("slow", "linear");

    $('#J_listRenameInput').focus();
    $('#J_listRenameInput').select();
    
    _event.preventDefault();
    //_event.stopPropagation();
  },

  listAdminHide: function(_event) {
    $('.J_listAdmin').fadeOut("slow");

    if (_event) {
      _event.preventDefault();
      _event.stopPropagation();
    }
  },

  listDeleteShow: function(_event) {
    this.listAdminHide();
    $('#J_listDeleteForm').fadeToggle("slow");
    $('#J_listDeleteBtn').focus();

    _event.preventDefault();
    //_event.stopPropagation();
  },

  keyboardCancel: function(e) {
    if (e.keyCode != window.STATICS.keysmap["ESC"]) return;
    this.listAdminHide();
  },

  listUpdate: function(_event) {
    var _url = "/list/" + window.STATICS.currentListId;

    $('#J_listRenameForm form').attr('action', _url);
  },

  listDelete: function(_event) {
    var _url = '/list/' + window.STATICS.currentListId;

    $('#J_listDeleteForm form').attr('action', _url);
  }
});

window.appView = new window.AppView();
