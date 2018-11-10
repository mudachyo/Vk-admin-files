var Tools = {
  showCheckResponse: function(resultLabelId, progress, msg, result) {
    var resultLabelClassName = result ? 'check_result_success' : 'check_result_error',
      classToRemove = result ? 'check_result_error' : 'check_result_success';

    addClass(resultLabelId, resultLabelClassName);
    removeClass(resultLabelId, classToRemove);

    hide(progress);
    val(resultLabelId, msg);
    show(resultLabelId);
  },
};

var ToolsConfData = {
  init: function(content) {
    var table = geByClass1('adminConfData__table');

    extend(cur, {
      confDataSimpleValueTab: '',
      confDataFavBtn: geByClass1('adminConfData__favButton'),
      confDataSearch: geByClass1('adminConfData__search'),
      confDataTable: table,
      confDataTableRows: geByTag1('tbody', table),
      confDataMore: geByClass1('adminConfData__more'),
      confDataFormPopupContent: content,
      confDataActiveRow: null,
      confDataActiveValue: null,
      confDataIsPartType: null,
      confDataIsNew: false,
    });

    ToolsConfData.listenTableClick();
  },

  listenTableClick: function() {
    if (!cur.confDataTable) {
      return;
    }

    addEvent(cur.confDataTable, 'click', ToolsConfData.onTableClick);
  },

  openFormBox: function() {
    if (cur.confDataFormPopup || !cur.confDataFormPopupContent) {
      return;
    }

    cur.confDataFormPopup = new MessageBox({
      onHide: function() {
        if (cur.confDataActiveRow) {
          cur.confDataActiveRow = null;
        }
        if (cur.confDataActiveValue) {
          cur.confDataActiveValue = null;
        }
      },
      onDestroy: function() {
        cur.confDataFormPopup = null;
        cur.confDataSimpleValueTab = '';
        cur.confDataIsPartType = null;
      }
    });

    cur.confDataFormPopup.addButton('Сохранить', ToolsConfData.onSave);
    cur.confDataFormPopup.addButton('Отмена', function() {
      ToolsConfData.closeFormBox();
    }, 'no');

    var delButton = cur.confDataFormPopup.addButton('Удалить', ToolsConfData.onDelete, 'no', true);
    addClass(domPN(delButton), 'adminConfDataForm__del');

    ToolsConfData.setFormPopupContent();
    cur.confDataFormPopup.show();
  },

  closeFormBox: function() {
    if (cur.confDataFormPopup) {
      cur.confDataFormPopup.hide();
    }
  },

  setFormPopupContent: function() {
    if (!cur.confDataFormPopup || !cur.confDataFormPopupContent) {
      console.warn('Попап с формой не создан');
      return;
    }

    cur.confDataFormPopup.content(cur.confDataFormPopupContent);

    cur.confDataFormProgress = geByClass1('adminConfDataForm__progress');
    cur.confDataForm = geByClass1('adminConfDataForm__content');
    cur.confDataFormControls = geByClass1('box_controls_wrap', cur.confDataFormPopup.bodyNode.closest('.popup_box_container'));

    cur.confDataFormInfo = geByClass1('adminConfDataForm__info');
    cur.confDataFormName = geByClass1('adminConfDataForm__field_name');
    cur.confDataFormDescription = geByClass1('adminConfDataForm__field_desc');

    cur.confDataFormPart = geByClass1('adminConfDataForm__part');
    cur.confDataFormPartRange = geByClass1('adminConfDataForm__field_partRange');
    cur.confDataFormPartText = geByClass1('adminConfDataForm__field_partText');
    cur.confDataFormPartDislayValue = geByClass1('adminConfDataForm__partValue');
    cur.confDataFormPartUidInput = geByClass1('adminConfDataForm__field_uid');
    cur.confDataFormPartUidsContainer = geByClass1('adminConfDataForm__partUidsContainer');

    cur.confDataFormSimpleValue = geByClass1('adminConfDataForm__simpleValue');
    cur.confDataFormSimpleValueSingleInput = geByClass1('adminConfDataForm__field_single');
    cur.confDataFormSimpleValueCodeInput = geByClass1('adminConfDataForm__field_code');
    cur.confDataFormSimpleValueArrayContainer = geByClass1('adminConfDataForm__simpleValueArrayContainer');

    cur.confDataFormHistory = geByClass1('adminConfDataForm__historyButton');
  },

  newKey: function() {
    cur.confDataIsNew = true;
    ToolsConfData.openFormBox();
    ToolsConfData.updateFormInfo({ canDelete: false });
    disable(cur.confDataFormName, false);
    hide(cur.confDataFormInfo);
    hide(cur.confDataFormHistory);
  },

  onTableClick: function(event) {
    var row = event.target.closest('.ui_table_row');

    if (!row) {
      return;
    }

    var name = trim(val(geByClass1('adminConfData__rowName', row)));

    if (!name) {
      return;
    }

    cur.confDataActiveRow = row;
    ToolsConfData.openKeyInfo(name);
  },

  openKeyInfo: function(name) {
    cur.confDataIsNew = false;

    ajax.post('/tools.php', {
      act: 'a_config_admin_info',
      name: name,
    }, {
      onDone: function(info) {
        if (info.noFound) {
          var err = 'Не получилось найти ключ: "' + name + '"';

          console.error(err);
          topError(err);
          ToolsConfData.closeFormBox();
        } else {
          ToolsConfData.updateFormInfo(info);
        }
      },
      onFail: function(err) {
        console.error(err + ': "' + name + '"');
        ToolsConfData.closeFormBox();
      },
      showProgress: function() {
        ToolsConfData.openFormBox();
        show(cur.confDataFormProgress);
        hide(cur.confDataForm);
        hide(cur.confDataFormControls);
      },
      hideProgress: function() {
        hide(cur.confDataFormProgress);
        show(cur.confDataForm);
        show(cur.confDataFormControls);
      }
    });
  },

  updateFormInfo: function(info) {
    ToolsConfData.toggleValueType(info.name);

    if (info.info) {
      val(cur.confDataFormInfo, info.info);
      show(cur.confDataFormInfo);
    } else {
      hide(cur.confDataFormInfo);
    }

    show(cur.confDataFormHistory);

    val(cur.confDataFormName, info.name);
    disable(cur.confDataFormName, true);

    val(cur.confDataFormDescription, info.description);

    var type;

    if (cur.confDataIsPartType) {
      var type = 'partRange';

      var part = isObject(info.value) ? info.value.part : info.value;

      ToolsConfData.onPartChange(part);

      if (info.value.uids) {
        (info.value.uids || []).forEach(function(user) {
          ToolsConfData.addUidItem(user.id, user.name, user.href);
        });
      }

    } else {
      if (isObject(info.value)) {
        type = 'simpleArray';
      } else if (isArray(info.value)) {
        type = 'simpleCode';
      } else {
        type = 'simpleSingle';
      }

      if (type === 'simpleCode' || type === 'simpleArray') {
        val(cur.confDataFormSimpleValueCodeInput, JSON.stringify(info.value, null, 4));
      }

      if (type === 'simpleArray') {
        var keys = Object.keys(info.value);
        var hasComplexValue = keys.some(function(key) {
          return typeof info.value[key] === 'object';
        });

        if (hasComplexValue) {
          type = 'simpleCode';

        } else {
          keys.forEach(function(key) {
            ToolsConfData.addArrayValue(key, info.value[key]);
          });
        }

      } else {
        val(cur.confDataFormSimpleValueSingleInput, info.value);
      }

    }

    ToolsConfData.switchValueTab(type);
    ToolsConfData.showDelete(info.canDelete);

    var value = ToolsConfData.getCurrentValue(info.name);

    if (value instanceof Error) {
      cur.confDataActiveValue = null;
    } else {
      cur.confDataActiveValue = JSON.stringify(value);
    }

  },

  toggleValueType: function(name) {
    var isPart = ToolsConfData.isPart(name);

    if (cur.confDataIsPartType === isPart) {
      return;
    }

    cur.confDataIsPartType = isPart;

    if (cur.confDataIsPartType) {
      hide(cur.confDataFormSimpleValue);
      ToolsConfData.switchValueTab('partRange');
      show(cur.confDataFormPart);

    } else {
      hide(cur.confDataFormPart);
      ToolsConfData.switchValueTab('simpleSingle');
      show(cur.confDataFormSimpleValue);
    }
  },

  isPart: function(name) {
    return (name || '').indexOf('c.test.part_') === 0;
  },

  getRowsCount: function() {
    return domChildren(cur.confDataTableRows).length;
  },

  onPartChange: function(value) {
    val(cur.confDataFormPartDislayValue, value);
    val(cur.confDataFormPartRange, value);
    val(cur.confDataFormPartText, value);
  },

  onSearch: function() {
    ToolsConfData.unselectFav();
    ToolsConfData.loadNewData();
    ToolsConfData.updateNavSearch();
  },

  updateNavSearch() {
    var q = val(uiSearch.getFieldEl(cur.confDataSearch));
    nav.setLoc(extend(nav.objLoc, { q: q || null }));
  },

  loadNewData: function() {
    ToolsConfData.getNewRows({}, {
      onDone: function(data) {
        val(cur.confDataTableRows, data.html);
        toggleClass(cur.confDataMore, 'unshown', !data.needMore);
      },
      showProgress: function () {
        uiSearch.showProgress(cur.confDataSearch);
      },
      hideProgress: function () {
        uiSearch.hideProgress(cur.confDataSearch);
      }
    });
  },

  loadMore: function() {
    ToolsConfData.getNewRows(
      {
        offset: ToolsConfData.getRowsCount(),
      },
      {
        onDone: function(data) {
          if (data.html) {
            geByClass('ui_table_row', ce('table', { innerHTML: data.html })).forEach(function(row) {
              cur.confDataTableRows.appendChild(row);
            })
          }

          toggleClass(cur.confDataMore, 'unshown', !data.needMore);
        },
        showProgress: function() {
          lockButton(cur.confDataMore);
        },
        hideProgress: function() {
          unlockButton(cur.confDataMore);
        }
      }
    );
  },

  getNewRows: function(params, options) {
    var isFav = ToolsConfData.isFav();

    ajax.post('/tools.php', extend({
      act: 'a_config_admin_rows',
      q: !isFav ? val(uiSearch.getFieldEl(cur.confDataSearch)) : '',
      isFav: isFav,
    }, params || {}), extend({
      onDone: function(data) {},
      onFail: function(err) {
        console.error(err);
      },
    }, options));
  },

  onSave: function() {
    var name = trim(val(cur.confDataFormName));

    if (!name) {
      var err = 'Обязательно должно быть указано название ключа';
      topError(err);  // todo show inline error
      console.error(err);
      return;
    }

    var description = trim(val(cur.confDataFormDescription));
    var value = ToolsConfData.getCurrentValue(name);

    if (value instanceof Error) {
      var err = 'Некорректное значение';
      topError(err); // todo show inline error
      console.error(err);
      return;
    }

    if ((!value && value !== 0) || (cur.confDataSimpleValueTab === 'simpleArray' && !Object.keys(value).length)) {
      var err = 'Обязательно должно быть указано значение ключа';
      topError(err); // todo show inline error
      console.error(err);
      return;
    }

    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    if (cur.confDataIsNew || cur.confDataActiveValue === value) {
      ToolsConfData._save({
        name: name,
        description: description,
        value: value,
      });
    } else {
      // Сохраняем данные об актином ключе, т.к. они сбросятся, когда откроем попап
      var _activeRow = cur.confDataActiveRow;
      var _currentValue = cur.confDataActiveValue;

      var box = new MessageBox({ title: `Изменение значения ключа: ${name}` });

      box.content('Вы уверены, что хотите изменить значение ключа?');

      box.addButton('Да', function() {
        cur.confDataActiveRow = _activeRow;
        cur.confDataActiveValue = _currentValue;
        box.hide();

        ToolsConfData._save({
          name: name,
          description: description,
          value: value,
        });
      });
      box.addButton('Нет', function() {
        cur.confDataActiveRow = _activeRow;
        cur.confDataActiveValue = _currentValue;
        box.hide();
      }, 'no');

      box.show();
    }
  },

  getCurrentValue: function(name) {
    var value;

    if (cur.confDataIsPartType) {
      var part = +val(cur.confDataFormPartText);

      if (part < 0 || part > 1) {
        value = new Error('Out range');

      } else {
        var uids = geByClass('adminConfDataForm__uidItem', cur.confDataFormPartUidsContainer).map(function(item) {
          return item.getAttribute('data-id');
        });

        if (uids.length) {
          value = {
            part: part,
            uids: uids,
          };
        } else {
          value = part;
        }
      }

    } else {
      if (cur.confDataSimpleValueTab === 'simpleArray') {
        value = geByClass('adminConfDataForm__arrItem', cur.confDataFormSimpleValueArrayContainer).reduce(function(keys, key) {
          var keyName = val(geByClass1('adminConfDataForm__field_arrName', key));
          var keyValue = val(geByClass1('adminConfDataForm__field_arrVal', key));

          if (keyName && keyValue) {
            keys[keyName] = keyValue;
          }

          return keys;
        }, {});

      } else if (cur.confDataSimpleValueTab === 'simpleCode') {
        try {
          value = JSON.parse(val(cur.confDataFormSimpleValueCodeInput));
        } catch(e) {
          value = e;
        }

      } else {
        value = val(cur.confDataFormSimpleValueSingleInput);
      }
    }

    return value;
  },

  _save: function(props) {
    ajax.post('/tools.php', extend({
      act: 'a_config_admin_save',
      isNew: cur.confDataIsNew,
    }, props), {
      onDone: function() {
        if (cur.confDataIsNew) {
          topMsg('Ключ добавлен');
          ToolsConfData._saveAskAddToFav(props.name);

        } else {
          topMsg('Ключ обновлен');
          ToolsConfData._updateActiveRowValue(props.value);
          ToolsConfData.closeFormBox();
        }
      },
      onFail: function(err) {
        console.error(err);
        topError(err);
      },
      showProgress: function() {
        cur.confDataFormPopup.showProgress();
        ToolsConfData.showDelete(false);
      },
      hideProgress: function() {
        cur.confDataFormPopup.hideProgress();
        ToolsConfData.showDelete(true);
      },
    });
  },

  _updateActiveRowValue: function(value) {
    if (!cur.confDataActiveRow) {
      return;
    }

    try {
      var parsedValue = JSON.parse(value);

      if (parsedValue['part']) {
        value = String(parsedValue['part']);
      }
    } catch(e){}

    var rowValue = geByClass1('adminConfData__rowValue', cur.confDataActiveRow);

    val(rowValue, String(value).substr(0, 200));
  },

  _saveAskAddToFav: function(name) {
    var box = new MessageBox({ title: 'Добавление ключа в избранные' });

    box.content('Добавить в избранные?');

    box.addButton('Да', function() {
      ToolsConfData._toggleFav(name,
        function() {
          box.hide();
          ToolsConfData.closeFormBox();
        },
        function() {
          box.hide();
          ToolsConfData.closeFormBox();
        },
        function() {
          box.showProgress();
        },
        function() {
          box.hideProgress();
        },
      );
    });
    box.addButton('Нет', function() {
      box.hide();
      ToolsConfData.closeFormBox();
    }, 'no');

    box.show();
  },

  onDelete: function() {
    var name = val(cur.confDataFormName);

    if (!name) {
      var err = 'Не указан ключ';
      topError(err);
      console.error(err);
      return;
    }

    // Сохраняем данные об актином ключе, т.к. они сбросятся, когда откроем попап
    var _activeRow = cur.confDataActiveRow;
    var _currentValue = cur.confDataActiveValue;

    var box = new MessageBox({ title: `Удаление ключа: ${name}` });

    box.content('Вы уверены, что хотите удалить этот ключ?');

    box.addButton('Удалить', function() {
      ajax.post('/tools.php', {
        act: 'a_config_admin_delete',
        name: name,
      }, {
        onDone: function() {
          var msg = `Ключ "${name}" удален`;
          topMsg(msg);
          console.log(msg);

          if (_activeRow) {
            re(_activeRow.closest('.ui_table_row'));
          }

          box.hide();
          ToolsConfData.closeFormBox();
        },
        onFail: function(err) {
          console.error(err + ': "' + name + '"');
          cur.confDataActiveRow = _activeRow;
          cur.confDataActiveValue = _currentValue;
          box.hide();
        },
        showProgress: function() {
          box.showProgress();
        },
        hideProgress: function() {
          box.hideProgress();
        }
      });
    });
    box.addButton('Отмена', function() {
      cur.confDataActiveRow = _activeRow;
      cur.confDataActiveValue = _currentValue;
      box.hide();
    }, 'no');

    box.show();
  },

  switchValueTab: function(type) {
    if (!inArray(type, ['simpleSingle',  'simpleArray', 'simpleCode', 'partRange', 'partText'])) {
      return;
    }

    if (cur.confDataSimpleValueTab === type) {
      return;
    }

    cur.confDataSimpleValueTab = type;

    var tabWrap = geByClass1('adminConfDataForm__valueTab_' + cur.confDataSimpleValueTab);
    var tab = geByClass1('ui_tab', tabWrap);

    uiTabs.switchTab(tab);

    geByClass('adminConfDataForm__tabContent').forEach(function(el) {
      if (!hasClass(el, 'adminConfDataForm__tabContent_' + type)) {
        hide(el);
      } else {
        show(el);
      }
    });
  },

  addArrayValue: function(key, value) {
    key = !isUndefined(key) ? key : '';
    value = !isUndefined(value) ? value : '';

    var index = domChildren(cur.confDataFormSimpleValueArrayContainer).length;
    var newItem = se(`
      <div class="adminConfDataForm__arrItem">
        <input type="text" class="dark adminConfDataForm__field_arrName" name="arr_name_${index}" value="${key}" placeholder="Название" />
        <input type="text" class="dark adminConfDataForm__field_arrVal" name="arr_val_${index}" value="${value}" placeholder="Значение" />
        <span class="adminConfDataForm__arrDel" onclick="ToolsConfData.removeArrayValue(this)"></span>
      </div>
    `);

    if (!key && !value && cur.confDataFormSimpleValueArrayContainer.firstChild) {
      domInsertBefore(newItem, cur.confDataFormSimpleValueArrayContainer.firstChild);
    } else {
      cur.confDataFormSimpleValueArrayContainer.appendChild(newItem);
    }
  },

  removeArrayValue: function(el) {
    re(el.closest('.adminConfDataForm__arrItem'));
  },

  addNewUid: function() {
    var id = trim(val(cur.confDataFormPartUidInput));

    if (id) {
      ToolsConfData.addUidItem(id, id, `https://vk.com/id${id}`);
      val(cur.confDataFormPartUidInput, '');
    }
  },

  addUidItem: function(id, name, href) {
    var newUid = se(`
      <div class="adminConfDataForm__uidItem" data-id="${id}">
        <a href="${href}" target="_blank">${name}</a>
        <span class="adminConfDataForm__uidItemDel" onclick="ToolsConfData.removeUidItem(this)"></span>
      </div>
    `);

    if (cur.confDataFormPartUidsContainer.firstChild) {
      domInsertBefore(newUid, cur.confDataFormPartUidsContainer.firstChild);
    } else {
      cur.confDataFormPartUidsContainer.appendChild(newUid);
    }
  },

  removeUidItem: function(el) {
    re(el.closest('.adminConfDataForm__uidItem'));
  },

  toggleToFav: function(name, el) {
    addClass(el, 'adminConfDataForm__infoFav_disabled');

    ToolsConfData._toggleFav(name,
      function(status) {
        toggleClass(el, 'adminConfDataForm__infoFav_active', status);
        removeClass(el, 'adminConfDataForm__infoFav_disabled');

        if (cur.confDataActiveRow) {
          toggleClass(geByClass1('adminConfData__row', cur.confDataActiveRow), 'adminConfData__row_fav', status);
        }
      },
      function() {
        removeClass(el, 'adminConfDataForm__infoFav_disabled');
      }
    );
  },

  _toggleFav: function(name, onSuccess, onFail, showProgress, hideProgress) {
    ajax.post('/tools.php', {
      act: 'a_config_admin_fav',
      name: name,
    }, {
      onDone: function(status) {
        onSuccess && onSuccess(status);
      },
      onFail: function(err) {
        onFail && onFail(err);
        console.error(err + ': "' + name + '"');
      },
      showProgress: function() {
        showProgress && showProgress();
      },
      hideProgress: function() {
        hideProgress && hideProgress();
      },
    });
  },

  showDelete: function(status) {
    toggleClass(geByClass1('adminConfDataForm__del'), 'hidden', !status);
  },

  isFav: function() {
    return attr(cur.confDataFavBtn, 'disabled');
  },

  selectFav: function() {
    if (ToolsConfData.isFav()) {
      return;
    }

    addClass(cur.confDataFavBtn, 'secondary');
    attr(cur.confDataFavBtn, 'disabled', true)

    val(uiSearch.getFieldEl(cur.confDataSearch), '');
    ToolsConfData.updateNavSearch();

    ToolsConfData.loadNewData();
  },

  unselectFav: function() {
    if (!ToolsConfData.isFav()) {
      return;
    }

    removeClass(cur.confDataFavBtn, 'secondary');
    cur.confDataFavBtn.removeAttribute('disabled');
  },

  openHistory: function() {
    var name = val(cur.confDataFormName);

    if (!name) {
      var err = 'Не указан ключ';
      topError(err);
      console.error(err);
      return;
    }

    // Сохраняем данные об актином ключе, т.к. они сбросятся, когда откроем попап
    var _activeRow = cur.confDataActiveRow;
    var _currentValue = cur.confDataActiveValue;

    var box = new MessageBox({ title: `История изменений ключа: ${name}`, hideButtons: true, onShow: function() {
      cur.confDataActiveRow = _activeRow;
      cur.confDataActiveValue = _currentValue;
    } });

    box.content('<div class="adminConfDataHistory__progress progress"></div>');

    show(geByClass1('adminConfDataHistory__progress'));

    ajax.post('/tools.php', {
      act: 'a_config_admin_history',
      name: name,
    }, {
      onDone: function(data) {
        if (data.empty) {
          box.content(data.empty);
          return;
        }

        box.content(
          data.templates.container.replace('{{nodes}}',
            data.nodes.reduce(function(nodes, node) {
              var author;

              if (node.author_href) {
                author = data.templates.author
                  .replace('{{name}}', node.author_name)
                  .replace('{{href}}', node.author_href);
              } else {
                author = node.author_name || data.templates.author_cli;
              }

              return nodes + data.templates.node
                .replace(/{{([a-z_]+)}}/g, function(str, param) {
                  if (param === 'author') {
                    return author;
                  }

                  return (typeof node[param] === 'object' ? JSON.stringify(node[param], null, 4) : node[param]) || '';
                });
            }, '')
          )
        );
      },
      onFail: function(err) {
        console.error(err + ': "' + name + '"');
        box.hide();
      },
    });

    box.show();
  },

  revertHistory: function(time, nodeRevert) {
    var name = val(cur.confDataFormName);

    if (!name || !time || time < 0) {
      var err = `Некорректные данные: ${name}, ${time}`;
      topError(err);
      console.error(err);
      return;
    }

    // Сохраняем данные об актином ключе, т.к. они сбросятся, когда откроем попап
    var _activeRow = cur.confDataActiveRow;
    var _currentValue = cur.confDataActiveValue;

    var value = domClosestSibling(nodeRevert, '.adminConfDataHistory__nodeValue');

    var box = new MessageBox({ title: `Откат значения ключа: ${name}`, onShow: function() {
      cur.confDataActiveRow = _activeRow;
      cur.confDataActiveValue = _currentValue;
    } });

    box.content('<p>Вы уверены, что хотите откатиться выбранному значению?</p>' + value.outerHTML);

    box.addButton('Да', function() {
      ajax.post('/tools.php', {
        act: 'a_config_admin_revert',
        name: name,
        time: time,
      }, {
        onDone: function() {
          topMsg('Значение ключа успешно откатилось');

          boxQueue.hideAll();
          ToolsConfData._updateActiveRowValue(value.textContent);
          ToolsConfData.openKeyInfo(name);
        },
        onFail: function(err) {
          console.error(err + ': "' + name + '"');
          box.hide();
        },
        showProgress: function() {
          box.showProgress();
        },
        hideProgress: function() {
          box.hideProgress();
        }
      });
    });
    box.addButton('Отмена', function() {
      box.hide();
    }, 'no');

    box.show();
  },

};

try{stManager.done('admin/tools/tools.js');}catch(e){}
