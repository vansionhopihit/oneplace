window.TaskModel = Backbone.Model.extend({
  attributes: {
    'id': 0,
    'name': "",
    'completed_at': null,
    'annotations': 0
  }
});

window.TaskCollection = Backbone.Collection.extend({
  model: window.TaskModel,
  url: "/tasks",
  initialize: function(){}
});

window.TaskView = Backbone.View.extend({
  el: "#J_tasks",

  events: {
    'click #J_taskAddBtn': 'taskCreateFromBtn',
    'keypress #J_taskAddInput': 'taskCreateFromInput',
    'click .J_taskDeleteBtn': 'taskDelete',
    'click .J_taskCompleteBtn': 'taskUpdate',
    'click .J_taskActiveBtn': 'taskUpdate',
    'click .J_taskAnnotateBtn': 'toggleAnnotations',
    'click .J_subAnnotationBtn': 'toggleAnnotationsReadOnly',
    'click .J_annotationCreateBtn': 'annotationCreate',
    'click .J_annotationCancelBtn': 'toggleAnnotations',
    'keypress .J_annotationInput': 'annotationInput'
  },

  initialize: function(){
    var _self = this;
    this.collection = new window.TaskCollection();
    this.collection.url = "/tasks/" + window.STATICS.currentListId;
    this.collection.fetch({
      success: function(res, status, xhr){
        _self.renderTasks(status, true);
      },

      error: _self.ajaxError
    });
  },

  taskCreateFromBtn: function(e){
    this.taskCreate();
    e.preventDefault();
    e.stopPropagation();
  },

  taskCreateFromInput: function(e) {
    if (e.keyCode != window.STATICS.keysmap["ENTER"]) return;
    this.taskCreate();
    e.preventDefault();
  },

  taskCreate: function() {
    var _url = "/new/task/" + window.STATICS.currentListId;
    var _taskInput = $('#J_taskAddInput');
    var _name = _taskInput.val().trim();
    var _self = this;

    $.ajax({
      url: _url,
      type: "POST",
      data: {
        "task": {
          "name": _name
        }
      },

      success: function(res, status, xhr) {
        var data = [];
        data[0] = eval("(" + res + ")");
        _self.renderTasks(data);
        _taskInput.val("");
      },

      error: _self.ajaxError
    });
  },

  ajaxError: function(res, status, xhr) {
    console && console.log() && console.log(res, status);
  },

  pick: function(value, def) {
    return (typeof value == 'undefined' ? def : value);
  },

  renderTasks: function(data, clear) {
    clear = this.pick(clear, false);

    var _target = $(this.el).find('#J_tasksContainer');

    if (clear) {
      _target.empty();
    }

    for (var i in data) {
      var _dom = this.getTemplateDom(data[i]);
      _dom.attr('id', data[i].id);
      _target.append(_dom);
    }
  },

  getTemplateDom: function(data) {
    var _html = _.template($('#J_taskTemplate').html());

    return $(_html(data));
  },

  taskDelete: function(e) {
    var _target = $(e.target).parents('li.task');
    var _taskId = _target.attr('id');
    var _url = '/task/' + _taskId;
    var _self = this;

    $.ajax({
      url: _url,
      type: "DELETE",
      
      beforeSend: function(xhr) {
        xhr.setRequestHeader("X-HTTP-Method-Override", "DELETE");
      },

      success: function(res, status, xhr) {
        _target.fadeOut();
        //_target.remove();
        _self.collection.remove(_self.collection.get(_taskId));
      },

      error: _self.error
    });


    e.preventDefault();
    e.stopPropagation();
  },

  taskUpdate: function(e) {
    var _target = $(e.target).parents('li.task');
    var _taskId = _target.attr('id');
    var _url = '/task/' + _taskId;
    var _self = this;

    $.ajax({
      url: _url,
      type: "PUT",

      beforeSend: function(xhr) {
        xhr.setRequestHeader("X-HTTP-Method-Override", "PUT");
      },

      success: function(res, status, xhr) {
        var _dom = _self.getTemplateDom(eval('(' + res + ')'));
        _target.html(_dom.children());
      },

      error: _self.error
    });

    e.preventDefault();
    e.stopPropagation();
  },

  toggleAnnotationsReadOnly: function(e) {
    this.toggleAnnotations(e, false);
  },

  toggleAnnotations: function(e, showEditor) {
    showEditor = this.pick(showEditor, true);

    var _target = $(e.target);
    var _taskId = _target.parents('li.task').attr('id');
    var _url = '/annotations/' + _taskId;
    var _self = this;

    e.preventDefault();
    e.stopPropagation();

    var _dom = _target.parents('li.task').find('.annotations');
    _dom.children().remove();
    $.ajax({
      url: _url,
      type: "GET",

      success: function(res, status, xhr) {
        var datas = eval('(' + res+ ')');

        if (datas.length > 0) {
          _.each(datas, function(item){
            _dom.append("<div class='annotation'>" + item.content + "</div>");
          });
        }

        if (showEditor) {
          _dom.append($('#md-editor-container').html());
          _dom.find('.md-editor textarea').focus();
        }
      },

      error: _self.error
    });

    $('.tasks li#'+_taskId).find('.writing').toggle();
    _dom.toggle();
    _dom.find('.md-editor textarea').focus();
    _dom.find('.md-editor textarea').select();
  },

  annotationCreate: function(e) {
    var _target = $(e.target);
    var _self = this;
    var _taskId = _target.parents('li.task').attr('id');
    var _url = '/annotation/' + _taskId;
    var _editorDom = _target.parents('.md-editor');
    var _editor = _editorDom.children('textarea');
    var _content = _editor.val().trim();

    $.ajax({
      url: _url,
      type: "POST",
      data: {
        "annotation": {
          "content": _content
        }
      },

      success: function(res, status, xhr) {

        var data = eval('(' + res + ')');

        _editorDom.before('<div class="annotation">' + data.content + '</div>');
        
        _editor.val('');
        _editor.focus();

        var subAnnotations = _target.parents('li.task').find('.J_subAnnotationBtn');
        var count = subAnnotations.text();
        count = parseInt(count) ? parseInt(count) : 0;
        if (0 == count) {
          subAnnotations.show();
        }
        subAnnotations.text(count + 1);
      },

      error: _self.error
    });

    e.preventDefault();
    e.stopPropagation();
  },

  annotationInput: function(e) {

    if (e.keyCode == window.STATICS.keysmap["ENTER"] && e.ctrlKey) {
      this.annotationCreate(e);
    }

    if (e.keyCode == window.STATICS.keysmap["ESC"] && e.ctrlKey) {
      this.toggleAnnotations(e);
    }

    console.log(e.keyCode);
    console.log(e.which);

  }

});

window.taskView = new window.TaskView();
