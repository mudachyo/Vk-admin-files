var GeodbPage = {
  rowsIndex: null,
  selectedRows: {},

  init: function() {
    GeodbPage.initShortcuts();
    GeodbPage.initIndexer();
    GeodbPage.focusOnFirstSearchBlock();
  },
  initIndexer: function() {
    GeodbPage.rowsIndex = new vkIndexer(GeodbPage.getRows(), function(row) { return GeodbPage.getObjectNameFromRow(row); });
  },
  initShortcuts: function() {
    addEvent(document, 'keydown', GeodbPage.fastCreateKeysShortcut);
  },
  focusOnFirstSearchBlock() {
    elfocus(geByClass('search_box').slice(-1).pop())
  },

  // Rows logic
  getRows: function() {
    // Nsh: Replace this with queries
    return geByClass('geodb_underlined_row');
  },
  getObjectName: function(objectId) {
    return val(GeodbPage.getObjectNameElement(objectId));
  },
  getObjectIdLabel: function(objectId) {
    return 'id' + objectId;
  },
  getObjectNameElement: function(objectId) {
    return ge(GeodbPage.getObjectRowId(objectId) + '_name');
  },
  getObjectFullNameElement: function(objectId) {
    return ge(GeodbPage.getObjectRowId(objectId) + '_fullname');
  },
  getObjectNameIdFromRow: function(row) {
    return row.id + '_name';
  },
  getObjectRowId: function(rowId) {
    return 'row' + rowId;
  },
  getObjectIdFromRowId: function(rowId) {
    var objectIdRegexp = /(\d+)$/g;
    var match = objectIdRegexp.exec(rowId);
    return match[1];
  },
  getObjectIdFromRow: function(row) {
    return GeodbPage.getObjectIdFromRowId(row.id);
  },
  getObjectIdsFromRows: function(objectRows) {
    return objectRows.map(function(row) {
      return GeodbPage.getObjectIdFromRow(row);
    });
  },
  getObjectNameFromRow: function(row) {
    return GeodbPage.getObjectNameFromRowId(row.id);
  },
  getObjectNameFromRowId: function(rowId) {
    var objectId = GeodbPage.getObjectIdFromRowId(rowId);
    return GeodbPage.getObjectName(objectId);
  },
  getObjectRow: function(objectId) {
    return ge(GeodbPage.getObjectRowId(objectId));
  },
  getObjectRows: function(objectIds) {
    var rows = [];
    objectIds.forEach(function(id) {
      rows.push(GeodbPage.getObjectRow(id));
    });
    return rows;
  },
  getObjectApproveLink: function(objectId) {
    return ge('object_approve_link' + objectId);
  },
  getObjectCommentLink: function(objectId) {
    return ge('object_comment_link' + objectId);
  },
  getObjectDateLink: function(objectId) {
    return ge('object_date_link' + objectId);
  },
  getAutocorrectionRows: function() {
    return Array.from(domQuery('div[id=autocorrection_row]'));
  },

  // General actions
  getNamesFromTextArea: function(areaId) {
    return val(areaId).split("\n");
  },
  showCommentBox: function(objectId) {
    ajax.post('geodb', { act: "a_get_comment", section: GeodbPage.getCurrentSection(), object_id: objectId }, {
      onDone: function(comment) {
        var options = {title: getLang('edit_add_comment_box_title'), width: 350},
          content;

        if (comment) {
          content = cur.commentBoxContent.replace("{author_name}", comment.author_name).replace("{date}", comment.date).replace("{comment_text}", comment.text);
        } else {
          content = cur.commentBoxContent.replace("{author_name}", '-').replace("{date}", '-').replace("{comment_text}", '');
        }

        GeodbPage.showMessageBox(content, options, function () {
          var commentText = val('comment_text');
          ajax.post('geodb', {
            act: "a_save_comment",
            section: GeodbPage.getCurrentSection(),
            object_id: objectId,
            comment_text: commentText
          }, GeodbPage.defaultAjaxResponseHandler(function () {
            var commentLink = GeodbPage.getObjectCommentLink(objectId);
            if (commentText) {
              val(commentLink, "Коммент(1)");
            } else {
              val(commentLink, "Коммент");
            }
            GeodbPage.hideCurrentBox();
          }));
        });
    }});
  },
  updateDate: function(objectId) {
    ajax.post('geodb.php', { act: "a_update_date", section: GeodbPage.getCurrentSection(), object_id: objectId }, GeodbPage.defaultAjaxResponseHandler(function(newDate) {
      var dateLink = GeodbPage.getObjectDateLink(objectId);
      val(dateLink, newDate);
    }));
  },
  disableRow: function(row) {
    disable(row);
  },
  disableRows: function(rows) {
    rows.forEach(function(row) {
      GeodbPage.disableRow(row);
    });
  },
  disableRowsById: function(objectIds) {
    objectIds.forEach(function(objectId) {
      GeodbPage.disableRowById(objectId);
    });
  },
  disableRowById: function(objectId) {
    var row = GeodbPage.getObjectRow(objectId);
    GeodbPage.disableRow(row);
  },
  getObjectInfoId: function(objectId) {
    return 'object_info' + objectId;
  },
  getObjectInfo: function(objectId) {
    return ge(GeodbPage.getObjectInfoId(objectId));
  },
  getObjectInfoByRow: function(row) {
    var objectId = GeodbPage.getObjectIdFromRow(row);
    return GeodbPage.getObjectInfo(objectId);
  },
  addObjectInfo: function(objectId, getInfoFunction) {
    var objectInfoId = GeodbPage.getObjectInfoId(objectId),
      oldObjectInfo = ge(objectInfoId);

    var objectRow = GeodbPage.getObjectRow(objectId),
      objectInfo = ce('div', { id: objectInfoId, innerHTML: cur.loadingGif }); // Todo nsh: replace with loading gif

    if (oldObjectInfo) {
      objectRow.removeChild(oldObjectInfo);
    }
    objectRow.appendChild(objectInfo);

    var callback = function(response) {
      objectInfo.innerHTML = response;
    };
    getInfoFunction(callback);
  },
  showMergeActionBox: function(mainObjectId, title, onSubmit) {
    var main = GeodbPage.getObjectRow(mainObjectId);
    var clones = geByClass('geodb_selected_row');
    if (main && clones.includes(main)) {
      GeodbPage.showError("Нельзя клеить объект к самому себе");
      notaBene(main);
      return;
    }

    var options = { title: title, width: 350 },
      content = cur.mergeBoxContent;
    GeodbPage.showMessageBox(content, options, function() {
      var mainId = val('main_select'),
      cloneIds = val('clones_select').split(',');

      var callback = function() {
        GeodbPage.disableRowsById(cloneIds);
        GeodbPage.addObjectStatuses(cloneIds, cur.queue_status_merging);
      };
      onSubmit(mainId, cloneIds, callback);
    });

    GeodbPage.addObjectsSingleSelect('main_select', main);
    GeodbPage.addObjectsMultiSelect('clones_select', clones);
  },
  showRenameActionBox: function(objectRows, action_name, type_name, onSubmit) {
    var title = objectRows.length === 1 ? GeodbPage.getObjectNameFromRow(objectRows[0]) : action_name;

    var options = { title: title, width: 750, submitButtonName: action_name,
      replacements: {
        rows_to_rename: GeodbPage.prepareObjectNamesForRenameBox(objectRows),
        autocorrections: GeodbPage.prepareAutocorrections(),
        objects_type: type_name
      }
    };
    var content = cur.renameBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var renamedObjects = domQuery('[id^=rename_box_object]');

      var objectIds = [];
      renamedObjects.forEach(function(e) {
        objectIds.push(e.id.replace('rename_box_object', ''));
      });

      var translations = GeodbPage.gatherTranslations();

      var callback = function() {
        GeodbPage.disableRowsById(objectIds);
        GeodbPage.addObjectStatuses(objectIds, cur.queue_status_renaming);
      };
      onSubmit(objectIds, translations, callback);
    });
  },
  showAreYouSureDeleteBox: function(objectRows, title, sureDeleteMessage, onSubmit) {
    var content = cur.deleteBoxContent,
      options = { title: title, width: 350, replacements: {
        text: sureDeleteMessage
      }
    };

    GeodbPage.showMessageBox(content, options, function() {
      var objectIds = val('objects_select').split(',');
      GeodbPage.addObjectStatuses(objectIds, cur.queue_status_deletion);
      onSubmit(objectIds);
    });

    // Initialize selects
    GeodbPage.addObjectsMultiSelect('objects_select', objectRows);
  },
  deleteAction: function(objectRows, onSubmit) {
    var objectIds = GeodbPage.getObjectIdsFromRows(objectRows);
    var callback = function() {
      GeodbPage.disableRowsById(objectIds);
      GeodbPage.addObjectStatuses(objectIds, cur.queue_status_deleting);
    };
    onSubmit(objectIds, callback);
  },
  approveRows: function(objectRows, func) {
    var objectIds = GeodbPage.getObjectIdsFromRows(objectRows);
    var callback = function() {
      GeodbPage.boldRows(objectRows);
    };
    func(objectIds, callback);
  },
  afterMoveCityCallback: function(objectRows) {
    GeodbPage.disableRows(objectRows);

    var objectIds = GeodbPage.getObjectIdsFromRows(objectRows);
    GeodbPage.addObjectStatuses(objectIds, cur.queue_status_moving);
  },

  // General callbacks
  defaultCreateObjectsCallback: function() {
    showDoneBox("Объекты созданы");
  },

  // Selection logic
  toggleRowSelect: function(checkbox) {
    if (isChecked(checkbox)) {
      GeodbPage.deselectCheckbox(checkbox);
    } else {
      GeodbPage.selectCheckbox(checkbox);
    }
    GeodbPage.updateSelectedCounter();
  },
  selectCheckbox: function(checkbox_element) {
    checkbox(checkbox_element, true);
    var row = GeodbPage.getRowByCheckbox(checkbox_element);
    GeodbPage.selectedRows[row.id] = row;
    addClass(row, 'geodb_selected_row');

    GeodbPage.tryToggleAllCheckbox();
    GeodbPage.updateSelectedCounter();
  },
  deselectCheckbox: function(checkbox_element) {
    checkbox(checkbox_element, false);
    var row = GeodbPage.getRowByCheckbox(checkbox_element);
    delete(GeodbPage.selectedRows[row.id]);
    removeClass(row, 'geodb_selected_row');

    GeodbPage.tryToggleAllCheckbox();
    GeodbPage.updateSelectedCounter();
  },
  selectRow: function(row) {
    var checkbox = GeodbPage.getCheckboxByRow(row);
    GeodbPage.selectCheckbox(checkbox);
  },
  deselectRow: function(row) {
    var checkbox = GeodbPage.getCheckboxByRow(row);
    GeodbPage.deselectCheckbox(checkbox);
  },
  selectAllRows: function(checkbox_element) {
    if (isChecked(checkbox_element)) {
      checkbox(checkbox_element, false);
      GeodbPage.getRows().forEach(function(row) {
        GeodbPage.deselectRow(row);
      });
    } else {
      checkbox(checkbox_element, true);
      GeodbPage.getRows().forEach(function(row) {
        GeodbPage.selectRow(row);
      });
    }
    GeodbPage.updateSelectedCounter();
  },
  selectRowByClick: function(event) {
    // This function is called also on link click, this 'if' prevents selection if link.
    // If it's checkbox - it's called twice, so it should be prevented also.
    if (event.target.nodeName.toLowerCase() !== 'a' && !hasClass(event.target, 'checkbox')) {
      var row = hasClass(event.target, 'geodb_underlined_row') ? event.target : gpeByClass('geodb_underlined_row', event.target);
      var checkbox = GeodbPage.getCheckboxByRow(row);
      GeodbPage.toggleRowSelect(checkbox);
    }
  },
  rowSelectShortcutListeners: function(event) {
    var row = hasClass(event.target, 'geodb_underlined_row') ? event.target : gpeByClass('geodb_underlined_row', event.target);
    var checkbox = GeodbPage.getCheckboxByRow(row);
    if (event.ctrlKey) {
      GeodbPage.selectCheckbox(checkbox);
    }
    if (event.shiftKey) {
      GeodbPage.deselectCheckbox(checkbox);
    }
  },
  getRowByCheckbox: function(checkbox) {
    var rowId = checkbox.id.replace(/_checkbox/, "");
    return ge(rowId);
  },
  getCheckboxByRow: function(row) {
    var checkboxId = row.id + '_checkbox';
    return ge(checkboxId);
  },
  tryToggleAllCheckbox: function() {
    // Todo: get Length of a object in js
    var enable = GeodbPage.getRows().length === Object.keys(GeodbPage.selectedRows).length;
    var all_checkboxes = geByClass('rows_menu_checkbox');
    all_checkboxes.forEach(function(checkbox_element) {
      checkbox(checkbox_element, enable);
    });
  },
  updateSelectedCounter: function() {
    var selectedAmount = geByClass('checkbox on').length;
    var allCheckboxesCount = geByClass('rows_menu_checkbox').length;
    if (isChecked(geByClass1('rows_menu_checkbox'))) {
      selectedAmount -= allCheckboxesCount;
    }

    var selectedAmountLabels = geByClass('selected_amount_label');
    selectedAmountLabels.forEach(function(label) {
      val(label, getLang('edit_selected_objects', selectedAmount, false));
    })
  },
  clearSelectedRows: function() {
    geByClass('geodb_selected_row').forEach(function(row) {
      GeodbPage.deselectRow(row);
    });
  },

  /**
   * Filters logic
   *
   * Filter section is a group of filters
   * Filter wrap is used for slideToggling if section is clicked
   */
  toggleFiltersWrap: function(filterWrapId, onToggle) {
    slideToggle(filterWrapId);

    var filterLabel = domPS(ge(filterWrapId));
    toggleClass(filterLabel, 'ui_rmenu_item_expanded');
    elfocus(ge(filterWrapId).children && ge(filterWrapId).children[0]);

    onToggle();
  },
  isFilterSectionActive: function(filterWrapId) {
    var filterLabel = GeodbPage._getFilterLabelByFilterWrap(filterWrapId);
    return hasClass(filterLabel, 'ui_rmenu_item_expanded') || hasClass(filterLabel, 'not_clickable');
  },
  _getFilterLabelByFilterWrap: function(filterWrapId) {
    return geByClass1('filter_label', domPN(ge(filterWrapId)))
  },
  getFilterValue: function(filterId) {
    return hasClass(filterId, 'on') ? 1 : 0;
  },

  // searchBoxes logic
  processSearchBoxes: function(e) {
    if (!e || e.code === 'Enter') {
      var searchBoxes = GeodbPage.getSearchBoxes(),
        newUrl = getCurrentUrl();

      searchBoxes.forEach(function(searchBox) {
        var paramName = searchBox.id.replace('search_by_', '') + '_name',
          paramValue = e.target === searchBox ? val(searchBox) : '';

        newUrl = getUpdatedUrlWithParameter(newUrl, paramName, paramValue);
      });

      nav.go(newUrl);
    }
  },
  getSearchBoxes: function() {
    return geByClass('search_box');
  },
  replaceRowsSlice: function(slice) {
    var oldRowsSlice = ge('geodb_rows_slice');
    oldRowsSlice.outerHTML = slice;
  },
  clearSearch: function() {
    var searchBoxes = GeodbPage.getSearchBoxes();
    searchBoxes.forEach(function(searchBox) {
      val(searchBox, '');
    });
    GeodbPage.processSearchBoxes();
  },

  // UI logic
  showMessageBox: function(content, options, onSubmit) {
    var defaultOptions = {
      id: 'current_box',
      title: 'Сообщение',
      width: 500,
      submitButtonName: getLang('global_submit'),
      cancelButtonName: getLang('global_cancel'),
      replacements: [],
      onHide: GeodbPage.removeMessageBoxSubmitListener,
    };
    options = extend(defaultOptions, options);

    // Do the replacements in content
    var replacements = options.replacements;
    for (var key in replacements) {
      content = content.replace('{' + key + '}', replacements[key]);
    }

    GeodbPage.addCurrentBoxCtrlEnterShortcut(onSubmit);

    var messageBox = new MessageBox(options);
    messageBox.content(content);
    messageBox.addButton(options.cancelButtonName, null, 'no');
    messageBox.addButton(options.submitButtonName, GeodbPage.defaultBoxSubmitHandler(onSubmit), '', true);
    messageBox.show();

    setTimeout(GeodbPage.focusOnFirstBoxInput, 400);
  },
  addCurrentBoxCtrlEnterShortcut: function(onSubmit) {
    var onCtrlEnterKey = function(event) {
      if (event.keyCode === KEY.RETURN && event.ctrlKey) {
        onSubmit();
      }
    };
    addEvent(window, 'keydown', onCtrlEnterKey);
  },
  removeMessageBoxSubmitListener: function() {
    removeEvent(window, 'keydown');
  },
  showReportBox: function(report, options, onHide) {
    var defaultOptions = {
      id: 'report_box',
      title: 'Отчет',
      width: 450,
      hideButtons: true,
      onHide: onHide,
    };
    options = extend(defaultOptions, options);

    var messageBox = new MessageBox(options);
    messageBox.content(GeodbPage.reportToString(report));
    messageBox.show();
  },
  hideCurrentBox: function() {
    var messageBox = curBox();
    if (messageBox) {
      messageBox.hide();
    }
  },
  addSingleSelect: function(selectId, elements, options) {
    var defaultOptions = {
      width: 300,
      autocomplete: true,
    };
    options = extend(defaultOptions, options);

    return new Dropdown(ge(selectId), GeodbPage.prepareElementsForSelect(elements), options);
  },
  addObjectsSingleSelect: function(selectId, selectedDefault) {
    var options = {
      width: 300,
      autocomplete: true,
    };

    if (selectedDefault) {
      options = extend(options, {
        selectedItems: GeodbPage.prepareObjectsForSelect([selectedDefault])
      })
    }

    return new Dropdown(ge(selectId), GeodbPage.prepareObjectsForSelect(GeodbPage.getRows()), options);
  },
  addObjectsMultiSelect: function(selectId, selectedDefault = false) {
    var options = {
      width: 300,
      autocomplete: true,
      multiselect: true,
    };

    if (selectedDefault) {
      options = extend(options, {
        selectedItems: GeodbPage.prepareObjectsForSelect(selectedDefault)
      })
    }

    return new Dropdown(ge(selectId), GeodbPage.prepareObjectsForSelect(GeodbPage.getRows()), options);
  },
  showAreYouSureDialog: function(text, onYes) {
    var messageBox = new MessageBox({title: getLang('global_action_confirmation')});
    messageBox.content(text);
    messageBox.addButton(getLang('global_no'), null, 'no');
    messageBox.addButton(getLang('global_yes'), onYes, '', true);
    messageBox.show();
  },
  showError: function(text) {
    topError(text, 3);
  },
  showErrorMessageBox: function() {
    var options = { title: getLang('edit_report'), width: 350, hideButtons: true },
      content = 'Неизвестная ошибка сервера';

    GeodbPage.showMessageBox(content, options);
  },
  showUnexpectedError: function() {
    GeodbPage.showError('Unexpected error happened!');
  },
  showNotImplementedError: function() {
    GeodbPage.showError(getLang('admin_feature_not_implemented'));
  },
  toggleMultiApprove: function() {
    var buttons = geByClass('approve_button');
    buttons.forEach(function(button) {
      if (hasClass(button, 'removed')) {
        removeClass(button, 'removed');
      } else {
        addClass(button, 'removed');
      }
    });
  },

  // Ui preparations
  prepareObjectsForSelect: function(objectRows) {
    return objectRows.map(function(row) {
      var object_id = GeodbPage.getObjectIdFromRowId(row.id);
      return [object_id, GeodbPage.getObjectName(object_id)];
    });
  },
  /**
   * @param elementsMap - May be Array od two types:
   *   0: [ 1: { id: 1, name: 'someName'}, 2: { id: 2, name: 'someName2'} ]
   *   1: [ 1: 'someName', 2: 'someName2' ]
   */
  prepareElementsForSelect: function(elementsMap) {
    var selectData = [];
    for(var elementId in elementsMap) {
      selectData.push(GeodbPage.prepareElementForSelect(elementsMap, elementId));
    }
    return selectData;
  },
  prepareElementForSelect: function(elementsMap, index) {
    var element = elementsMap[index];
    return (element.id && element.name) ? [element.id, element.name] : [index, element];
  },
  prepareObjectNamesForRenameBox: function(objectRows) {
    var objectNames = '';
    objectRows.forEach(function(row) {
      var objectId = GeodbPage.getObjectIdFromRowId(row.id);
      objectNames += cur.renameRow.split('{objectId}').join(objectId).split('{name}').join(GeodbPage.getObjectName(objectId));
    });
    return objectNames;
  },
  prepareAutocorrections: function() {
    var autocorrectionRows = '';

    cur.autocorrections.forEach(function(autocorrection) {
      var autocorrectionRow = GeodbPage.createAutocorrectionRow(autocorrection.replaceWhat, autocorrection.replaceWith);
      autocorrectionRows += autocorrectionRow;
    });

    return autocorrectionRows;
  },
  focusOnFirstBoxInput: function() {
    var textareaElement = geByTag1('textarea', geByClass1('box_body'));

    var inputElements = domQuery(':not(.selector) > input', geByClass1('box_body')),
      inputElement = inputElements ? inputElements[0] : null;

    var prioritizedElement = textareaElement || inputElement;
    elfocus(prioritizedElement);
  },

  // Almost every showBox function can be applied to single(object action) or multiple(top multiple actions) rows
  callFunctionForSingleRow: function(rowId, func) {
    var arr = [ GeodbPage.getObjectRow(rowId) ];
    func(arr);
  },
  callFunctionForMultipleRows: function(func) {
    if (isObjectEmpty(GeodbPage.selectedRows)) {
      func(Object.values(GeodbPage.getRows()));
    } else {
      func(Object.values(GeodbPage.selectedRows));
    }
  },

  // Response handlers
  defaultAjaxResponseHandler: function(onSuccess = function() { topMsg("Success", 2)}, onFail = function() { topError("Error", 2)}, onForbidden = function() { topMsg('Forbidden', 2) }) {
    return {
      onDone: function(response) {
        if (response) {
          GeodbPage.clearSelectedRows();
          onSuccess(response);
        } else {
          GeodbPage.showError(getLang('edit_access_forbidden'));
          onForbidden();
        }
      },
      onFail: function() {
        GeodbPage.showError("Default ajax response error");
        onFail();
      }
    }
  },
  defaultBoxSubmitHandler: function(onSubmit) {
    return function() {
      onSubmit();
      GeodbPage.hideCurrentBox();
      GeodbPage.clearSelectedRows();
    }
  },
  reportToString: function(report) {
    var stringReport = '';
    report.forEach(function(reportRow) {
      var objectName = GeodbPage.getObjectName(reportRow['id']) || GeodbPage.getObjectIdLabel(reportRow['id']);
      stringReport += cur.reportRow.replace('{name}', objectName).replace('{status}', reportRow['status']);
    });
    return stringReport;
  },
  addObjectStatus: function(objectId, name) {
    var statusLabel = cur.objectStatusTemplate.replace('{status_label}', name);
    var rowInfo = geByClass1('row_info', GeodbPage.getObjectRow(objectId));
    rowInfo.innerHTML += statusLabel;
  },
  addObjectStatuses: function(objectIds, statusName) {
    objectIds.forEach(function(objectId) {
      GeodbPage.addObjectStatus(objectId, statusName);
    });
  },

  // Renaming
  getNameInputsFromRenameBox: function() {
    return Array.from(domQuery('input[id^=rename_box_object]'));
  },
  // update autocorrections from rename box with Geodb's object. Function naming is legacy
  convertNamesToAaCase: function() {
    var inputs = GeodbPage.getNameInputsFromRenameBox();

    inputs.forEach(function(input) {
      var newName = val(input).replace(/[^\s]*[\s]?/g, function(word) {
        return capitalizeFirstLetter(word);
      });
      val(input, newName);
    });
  },
  convertNamesToAaBbCase: function() {
    // It's so called Title-case
    var inputs = GeodbPage.getNameInputsFromRenameBox();

    inputs.forEach(function(input) {
      var newName = val(input).replace(/[^\s]*[\s]?/g, function(word) {
        return capitalizeFirstLetter(word);
      });
      val(input, newName);
    });
  },
  convertNamesToAabbCase: function() {
    var inputs = GeodbPage.getNameInputsFromRenameBox();

    inputs.forEach(function(input) {
      var newName = val(input).replace(/[^\s]*[\s]?/g, function (word, offset) {
        // Capitalize first word, uncapitalize others
        if (offset === 0) {
          return capitalizeFirstLetter(word);
        } else {
          return uncapitalizeFirstLetter(word);
        }
      });
      val(input, newName);
    });
  },
  singleReplaceTextInNames: function() {
    var replaceWhat = val('replaceWhat'),
      replaceWith = val('replaceWith');
    GeodbPage.replaceTextInNames(replaceWhat, replaceWith);
  },
  replaceTextInNames: function(replaceWhat, replaceWith) {
    var inputs = GeodbPage.getNameInputsFromRenameBox();
    inputs.forEach(function(input) {
      var newName = val(input).replace(replaceWhat, replaceWith);
      val(input, newName);
    });
  },
  addAutocorrectionRow: function() {
    // Todo nsh: remove this crutch - create element from skin normally

    var div = ce('div');
    div.innerHTML = GeodbPage.createAutocorrectionRow('', '');
    var row = domFC(div);

    ge('autocorrection_rows').appendChild(row);
  },
  removeAutocorrectionRow: function(row) {
    re(row);
  },
  autocorrectInputs: function() {
    var checkedAutocorrections = GeodbPage.getCheckedAutocorrections();

    checkedAutocorrections.forEach(function(autocorrection) {
      var replaceWhat = val(domQuery('[id^=autocorrection_what]', autocorrection)[0]),
        replaceWith = val(domQuery('[id^=autocorrection_with]', autocorrection)[0]);
      GeodbPage.replaceTextInNames(replaceWhat, replaceWith);
    });
  },
  autocorrectInput: function(input) {
    var checkedAutocorrections = GeodbPage.getCheckedAutocorrections();

    checkedAutocorrections.forEach(function(autocorrection) {
      var replaceWhat = val(domQuery('[id^=autocorrection_what]', autocorrection)[0]),
        replaceWith = val(domQuery('[id^=autocorrection_with]', autocorrection)[0]),
        newName = val(input).replace(replaceWhat, replaceWith);
      val(input, newName);
    });
  },
  getCheckedAutocorrections: function() {
    var autocorrectionRows = GeodbPage.getAutocorrectionRows();
    GeodbPage.synchronizeAutocorrections();

    // Filter unchecked autocorrections
    return autocorrectionRows.filter(function(row) {
      var isChecked = domByClass(row, 'checkbox on');
      return isChecked;
    });
  },
  saveAutocorrections: function() {
    GeodbPage.synchronizeAutocorrections();

    var replaceWhatArray = [];
    var replaceWithArray = [];
    cur.autocorrections.forEach(function(autocorrection) {
      replaceWhatArray.push(autocorrection['replaceWhat']);
      replaceWithArray.push(autocorrection['replaceWith']);
    });

    ajax.post('geodb.php', { act: 'a_save_autocorrections',
      section: cur.section,
      replace_what_array: replaceWhatArray,
      replace_with_array: replaceWithArray,
    }, GeodbPage.defaultAjaxResponseHandler());
  },
  synchronizeAutocorrections: function() {
    var autocorrectionRows = GeodbPage.getAutocorrectionRows();
    cur.autocorrections = [];

    for(var i = 0; i < autocorrectionRows.length; i++) {
      var autocorrectionWhatFromBox = val(domQuery('[id^=autocorrection_what]', autocorrectionRows[i])[0]),
        autocorrectionWithFromBox = val(domQuery('[id^=autocorrection_with]', autocorrectionRows[i])[0]);

      cur.autocorrections.push({
        replaceWhat: autocorrectionWhatFromBox,
        replaceWith: autocorrectionWithFromBox
      });
    }
  },
  getNextAutocorrectionId: function() {
    return cur.autocorrections.length;
  },
  replaceObjectName: function(id, name) {
    val(ge(GeodbPage.getObjectRowId(id) + '_name'), name);
  },
  replaceObjectNames: function(objectIds, objectNames) {
    for (var i = 0; i < objectIds.length; i++) {
      GeodbPage.replaceObjectName(objectIds[i], objectNames[i]);
    }
  },
  createAutocorrectionRow: function(whatToReplace, withToReplace) {
    return cur.autocorrectionRowContent.replace('{autocorrection_what}', whatToReplace).replace('{autocorrection_with}', withToReplace);
  },
  showTranslatedNames: function() {
    if (geByClass1('translation_en') || geByClass1('translation_ua') || geByClass1('translation_kz')) {
      notaBene('rename_box_names_panel');
      return;
    }

    var objectIds = Array.from(domQuery('[id^=rename_box_object]')).map(function(element) { return element.id.replace('rename_box_object', ''); });
    ajax.post('geodb', { act: "a_get_translations", section: GeodbPage.getCurrentSection(), object_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.appendTranslations.pbind()));
  },
  appendTranslations: function(response) {
    // Show hidden ru labels
    var ruTranslationRows = Array.from(geByClass('translation_ru'));
    ruTranslationRows.forEach(function(row) {
      var label = geByClass1('label', row);
      removeClass(label, 'removed');

      // Swap classes, coz rename_box_translated_name has less padding
      var input = geByTag1('input', row);
      removeClass(input, 'rename_box_name');
      addClass(input, 'rename_box_translated_name');
    });

    for (var objectId in response) {
      console.log(response[objectId]);
      var translations = response[objectId];
      for (var iso in translations) {
        var translation = translations[iso] || '';
        var renameRow = cur.renameTranslationRow.split('{iso}').join(iso).split('{translation}').join(translation);
        ge('rename_box_object' + objectId).innerHTML += renameRow;
      }
    }
  },
  showTranslationsButton: function() {
    removeClass(ge('translations_button'), 'removed');
  },
  defaultRenameSubmitHandler: function() {

  },
  gatherTranslations() {
    var getValueFromInputFunction = function(input) {
      return val(input);
    };

    var translations = {};
    translations[cur.LANG_RUS] = Array.from(domQuery('.translation_ru input')).map(getValueFromInputFunction);
    translations[cur.LANG_ENG] = Array.from(domQuery('.translation_en input')).map(getValueFromInputFunction);
    translations[cur.LANG_UKR] = Array.from(domQuery('.translation_ua input')).map(getValueFromInputFunction);
    translations[cur.LANG_KAZ] = Array.from(domQuery('.translation_kz input')).map(getValueFromInputFunction);

    return translations;
  },

  // Opening in tabs, redirecting
  openRowsInTabs: function(rows) {
    rows.forEach(function() {
      var objectsUrl = GeodbPage.getObjectNameElement(rowId).href;
      window.open(objectsUrl);
    });
  },
  openSelectedRowsInTabs: function() {
    Object.values(GeodbPage.selectedRows).forEach(function(row) {
      var objectsUrl = GeodbPage.getObjectNameElement(GeodbPage.getObjectIdFromRowId(row.id)).href;
      window.open(objectsUrl);
    });
  },
  toPage: function(page_number) {
    nav.go(extend(nav.objLoc, { page: page_number }));
  },
  /**
   * @param {string} toNext : 1 means to next, 0 - to previous
   */
  toNextClosestObject: function(toNext) {
    var objectId;
    switch(cur.section) {
      case GeodbPage.GEODB_SECTION_CITIES:        objectId = getUrlParam('cn_id'); break;
      case GeodbPage.GEODB_SECTION_UNIVERSITIES:  objectId = getUrlParam('c_id'); break;
      case GeodbPage.GEODB_SECTION_FACULTIES:     objectId = getUrlParam('u_id'); break;
      case GeodbPage.GEODB_SECTION_CHAIRS:        objectId = getUrlParam('f_id'); break;
      case GeodbPage.GEODB_SECTION_SCHOOLS:       objectId = getUrlParam('c_id'); break;
      case GeodbPage.GEODB_SECTION_STATIONS:      objectId = getUrlParam('c_id'); break;
      case GeodbPage.GEODB_SECTION_DISTRICTS:     objectId = getUrlParam('c_id'); break;
      case GeodbPage.GEODB_SECTION_STREETS:       objectId = getUrlParam('c_id'); break;
      case GeodbPage.GEODB_SECTION_REGIONS:       objectId = getUrlParam('cn_id'); break;
      case GeodbPage.GEODB_SECTION_AREAS:         objectId = getUrlParam('region_id'); break;
    }
    nav.go('geodb.php?act=a_redirect_to_closest_object&to_next=' + toNext + '&section=' + cur.section + '&object_id=' + objectId);
  },

  // Searching
  showFilteredByName: function() {
    var stringToSearch = val('search_by_name');

    if (stringToSearch) {
      var matchedRows = GeodbPage.rowsIndex.search(stringToSearch);
      GeodbPage.getRows().forEach(function(row) {
        if (matchedRows.includes(row)) {
          show(row);
        } else {
          hide(row);
        }
      });
    } else {
      GeodbPage.getRows().forEach(function(row) {
        row.style.display = '';
      });
    }
  },

  // Misc
  expandCityChildren: function() {
    addClass(ge('city_children_links_wrap'), 'inline');

    removeClass(ge('city_children_expand_link'), 'inline');
    addClass(ge('city_children_expand_link'), 'removed');
  },
  expandCountryChildren: function() {
    addClass(ge('country_children_links_wrap'), 'inline');

    removeClass(ge('country_children_expand_link'), 'inline');
    addClass(ge('country_children_expand_link'), 'removed');
  },
  expand: function(element) {
    var toExpand = ge(element.id.replace('_expander', ''));
    removeClass(toExpand, 'removed');
    addClass(element, 'removed');
  },
  showCreateBox: function() {
    switch (cur.section) {
      case cur.GEODB_SECTION_COUNTRIES:
        break;
      case cur.GEODB_SECTION_CITIES:
        CitiesFunctions.showCreateCitiesBox();
        break;
      case cur.GEODB_SECTION_UNIVERSITIES:
        UniversitiesFunctions.showCreateUniversitiesBox();
        break;
      case cur.GEODB_SECTION_FACULTIES:
        FacultiesFunctions.showCreateFacultiesBox();
        break;
      case cur.GEODB_SECTION_CHAIRS:
        ChairsFunctions.showCreateChairsBox();
        break;
      case cur.GEODB_SECTION_SCHOOLS:
        SchoolsFunctions.showCreateSchoolsBox();
        break;
      case cur.GEODB_SECTION_STREETS:
        StreetsFunctions.showCreateStreetsBox();
        break;
      case cur.GEODB_SECTION_STATIONS:
        StationsFunctions.showCreateStationsBox();
        break;
      case cur.GEODB_SECTION_DISTRICTS:
        DistrictsFunctions.showCreateDistrictsBox();
        break;
      case cur.GEODB_SECTION_REGIONS:
        RegionsFunctions.showCreateRegionsBox();
        break;
      case cur.GEODB_SECTION_REQUESTS:
        break;
      case cur.GEODB_SECTION_ADMINS:
        break;
      default:
        alert('Error in showCreateBox');
        break;
    }
  },
  fastCreateKeysShortcut: function(event) {
    if ((event.ctrlKey || event.altKey && browser.mac) && event.keyCode === 32 && !curBox()) { // Ctrl + Space
      GeodbPage.showCreateBox();
    }
  },
  getCurrentAct: function() {
    return getUrlParam('act');
  },
  getCurrentSection: function() {
    var act = GeodbPage.getCurrentAct();

    switch(act) {
      case 'regions':      return 13;
      case 'cities':       return 9;
      case 'universities': return 2;
      case 'faculties':    return 6;
      case 'chairs':       return 7;
      case 'schools':      return 3;
      case 'stations':     return 5;
      case 'districts':    return 8;
      case 'streets':      return 4;
      default:             return 0;
    }
  },
  isRowBold: function(row) {
    return hasClass(GeodbPage.getObjectNameElement(GeodbPage.getObjectIdFromRow(row)), 'approved_by_admin');
  },
  boldRow: function(row) {
    var objectId = GeodbPage.getObjectIdFromRow(row),
        approveLink = GeodbPage.getObjectApproveLink(objectId),
        nameRowId = GeodbPage.getObjectNameIdFromRow(row),
        approvedClassName = 'approved_by_admin';

    if (!hasClass(nameRowId, approvedClassName)) {
      addClass(nameRowId, approvedClassName);
      val(approveLink, getLang('edit_unapprove'));
    }
  },
  boldRows: function(rows) {
    rows.forEach(function(row) {
      GeodbPage.boldRow(row);
    });
  },
  unboldRow: function(row) {
    var objectId = GeodbPage.getObjectIdFromRow(row),
        approveLink = GeodbPage.getObjectApproveLink(objectId),
        nameRowId = GeodbPage.getObjectNameIdFromRow(row),
        approvedClassName = 'approved_by_admin';

    if (hasClass(nameRowId, approvedClassName)) {
      removeClass(nameRowId, approvedClassName);
      val(approveLink, getLang('edit_approve'));
    }
  },
  unboldRows: function(rows) {
    rows.forEach(function(row) {
      GeodbPage.unboldRow(row);
    });
  },

  // main.js wrappers
  updateUrl: function(urlParams) {
    nav.setLoc(extend(nav.objLoc, urlParams));
  },
  showLoader: function() {
    var box = new MessageBox();
    box.setOptions({title: false, hideButtons: true}).show();

    hide(boxLayerBG);
    hide(box.bodyNode);
    show(boxLoader);
    boxRefreshCoords(boxLoader);
  },
  hideLoader: function() {
    if (curBox && curBox()) {
      curBox().hide();
    }
  },
  geByClassInCurBox: function(className) {
    return geByClass1(className, curBox().bodyNode);
  },

  // Custom strange geodb admins real sht(dope), which they like a lot :D

  redirectToCities: function(event) {
    if (!event || event.code === 'Enter') {
      var cityName = val(event.target);
      nav.go('geodb.php?act=cities&cn_id=' + cur.countryId + '&city_name=' + cityName);
    }
  },
  updateAndRedirect: function(url_key, url_value) {
    var newUrl = getUpdatedUrlWithParameter(getCurrentUrl(), url_key, url_value);
    nav.go(newUrl);
  },
};

// Util functions which don't belong to GeodbPage object
// Those ones i don't want to put in GeodbPage lib, because, there are obviously alternatives in common.js
function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}
function getUrlParam(paramName) {
  return nav.objLoc[paramName];
}
function getCurrentUrlWithOnlyAct() {
  var url = getCurrentUrl(),
    urlWithoutParams = url.replace(new RegExp("\\?.*", "i"), '');

  return urlWithoutParams + '?act=' + getUrlParam('act');
}
function getCurrentUrl() {
  return window.location.href;
}
function getCurrentUrlWithPageParam(page) {
  var currentUrl = getCurrentUrl();
  return getUpdatedUrlWithParameter(currentUrl, 'page', page);
}
function getUpdatedUrlWithParameter(url, key, value) {
  var regex = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = url.indexOf('?') !== -1 ? "&" : "?";

  if (url.match(regex)) {
    return url.replace(regex, '$1' + key + "=" + value + '$2');
  } else {
    return url + separator + key + "=" + value;
  }
}
function redirect(url) { window.location.href = url; }
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function uncapitalizeFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
function isDivEmpty(div) {
  return domChildren(div).length === 0;
}
function delay(callback, ms) {
  var timer = 0;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
}

try{stManager.done('admin/geodb/main.js');}catch(e){}
