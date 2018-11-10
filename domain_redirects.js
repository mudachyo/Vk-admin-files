var DomainRedirects = {
  checkRedirectFromTimeout: setTimeout(null),
  checkRedirectToTimeout: setTimeout(null),

  // Main logic
  createRedirect: function() {
    var fromDomainInput = ge('redirect_from'),
      toDomainInput = ge('redirect_to'),
      comment = val('new_redirect_comment'),
      redirectButton = ge('add_redirect_button');

    if (!val(fromDomainInput) || val(fromDomainInput).length < 2 || (isVisible('redirect_from_check_result') && hasClass('redirect_from_check_result', 'check_result_error'))) {
      return notaBene(fromDomainInput);
    }
    if (!val(toDomainInput) || val(toDomainInput).length < 2 || (isVisible('redirect_to_check_result') && hasClass('redirect_to_check_result', 'check_result_error'))) {
      return notaBene(toDomainInput);
    }

    lockButton(redirectButton);
    ajax.post('/tools/domain_redirects', { act: 'a_add_redirect', hash: cur.domainRedirectsHash, redirect_from: val(fromDomainInput), redirect_to: val(toDomainInput), comment: comment }, {
      onDone: function(response) {
        if (response) {
          showDoneBox(response);
          DomainRedirects.clearCreateRedirectInputs();
          unlockButton(redirectButton);
        } else {
          showDoneBox(getLang('global_error'));
          unlockButton(redirectButton);
        }
      },
      onFail: function() {
        showDoneBox(getLang('global_error'));
        unlockButton(redirectButton);
      }
    });
  },
  showSureDelete: function(deleteButton) {
    var row = domPN(deleteButton),
      header = getLang('global_warning'),
      content = getLang('admin_sure_delete_redirect');

    showFastBox(header, content, getLang('global_yes'), function() {
      curBox().showProgress();
      DomainRedirects.deleteRow(row);
    }, getLang('global_cancel'));
  },
  deleteRow: function(row) {
    if (hasClass(row, 'deleted_row')) return;

    var redirectFrom = domData(geByClass1('redirect_from', row), 'domain');
    ajax.post('/tools/domain_redirects', { act: 'a_delete_redirect', hash: cur.domainRedirectsHash, redirect_from: redirectFrom }, {
      onDone: function(response) {
        if (response) {
          boxQueue.hideAll();
          showDoneBox(response);
        } else {
          curBox().hide();
          showDoneBox(getLang('global_error'));
        }
      },
      onFail: function(response) {
        curBox().hide();
        showDoneBox(response);
        return true;
      }
    });
  },
  showAllRedirectsBox: function() {
    showBox('/tools.php', { act: 'a_all_redirects_box' }, {
      params: { width: 600 }
    });
  },

  // Checks
  checkRedirectFrom: function() {
    hide('redirect_from_check_result');

    var domainName = val('redirect_from');
    if (domainName.length < 2) {
      return;
    }

    clearTimeout(DomainRedirects.checkRedirectFromTimeout);
    hide('redirect_from_check_result');
    show('redirect_from_progress_bar');

    DomainRedirects.checkRedirectFromTimeout = setTimeout(function(){
      ajax.post('/tools.php', {act: 'a_domain_check', domain: domainName}, {
        onDone: function(msg) {
          Tools.showCheckResponse('redirect_from_check_result', 'redirect_from_progress_bar', msg, true);
        },
        onFail: function(msg) {
          Tools.showCheckResponse('redirect_from_check_result', 'redirect_from_progress_bar', msg, false);
          return true;
        }
      });
    }, 500);
  },
  checkRedirectTo: function() {
    hide('redirect_to_check_result');

    var domainName = val('redirect_to');
    if (domainName.length < 2) {
      return;
    }

    clearTimeout(DomainRedirects.checkRedirectToTimeout);
    show('redirect_to_progress_bar');

    DomainRedirects.checkRedirectToTimeout = setTimeout(function() {
      ajax.post('/tools.php', {act: 'a_link_check', owner_link: domainName}, {
        onDone: function(msg) {
          Tools.showCheckResponse('redirect_to_check_result', 'redirect_to_progress_bar', msg, true);
        },
        onFail: function(msg) {
          Tools.showCheckResponse('redirect_to_check_result', 'redirect_to_progress_bar', msg, false);
          return true;
        }
      });
    }, 500);
  },

  clearCreateRedirectInputs: function() {
    val('redirect_from', '');
    hide('redirect_from_check_result');
    hide('redirect_from_progress_bar');

    val('redirect_to', '');
    hide('redirect_to_check_result');
    hide('redirect_to_progress_bar');

    val('new_redirect_comment', '');
  }
};

try{stManager.done('admin/tools/domain_redirects.js');}catch(e){}
