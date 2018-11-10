var ChatRightsTransferPage = {
  checkUserLinkTimeout: setTimeout(null),
  checkChatLinkTimeout: setTimeout(null),

  checkUserLink: function() {
    clearTimeout(ChatRightsTransferPage.checkUserLinkTimeout);
    ChatRightsTransferPage.clearChatLinkInput();
    hide('user_link_check_result');
    show('user_link_progress_bar');

    ChatRightsTransferPage.checkUserLinkTimeout = setTimeout(function() {
      var userLink = val('user_link');

      if (userLink.length < 2) {
        hide('user_link_check_result');
        hide('user_link_progress_bar');
        return;
      }

      ajax.post('/tools.php', { act: 'a_check_user_link', user_link: userLink }, {
        onDone: function(response) {
          var responseType = !!response;
          Tools.showCheckResponse('user_link_check_result', 'user_link_progress_bar', response, responseType);
        },
        onFail: function(response) {
          Tools.showCheckResponse('user_link_check_result', 'user_link_progress_bar', response, false);
          return true;
        },
        showProgress: show.pbind('user_link_progress_bar'),
        hideProgress: hide.pbind('user_link_progress_bar'),
      });
    }, 500);
  },
  checkChatLink: function() {
    clearTimeout(ChatRightsTransferPage.checkChatLinkTimeout);
    hide('chat_link_check_result');
    show('chat_link_progress_bar');

    ChatRightsTransferPage.checkChatLinkTimeout = setTimeout(function() {
      var userLink = val('user_link'),
        chatLink = val('chat_link');

      if (!userLink || (isVisible('user_link_check_result') && hasClass('user_link_check_result', 'check_result_error'))) {
        hide('user_link_check_result');
        hide('chat_link_progress_bar');
        return notaBene('user_link');
      }
      if (!chatLink) {
        ChatRightsTransferPage.clearChatLinkInput();
        hide('chat_link_progress_bar');
        return;
      }

      ajax.post('/tools.php', { act: 'a_check_user_chat_link', user_link: userLink, chat_link: chatLink }, {
        onDone: function(response) {
          Tools.showCheckResponse('chat_link_check_result', 'chat_link_progress_bar', response, true);
        },
        onFail: function(response) {
          Tools.showCheckResponse('chat_link_check_result', 'chat_link_progress_bar', response, false);
          return true;
        },
        showProgress: show.pbind('chat_link_progress_bar'),
        hideProgress: hide.pbind('chat_link_progress_bar'),
      });
    }, 500);
  },
  changeCreator: function() {
    var userLink = val('user_link'),
      chatLink = val('chat_link'),
      comment = val('comment');

    if (!userLink || (isVisible('user_link_check_result') && hasClass('user_link_check_result', 'check_result_error'))) {
      return notaBene('user_link');
    }
    if (!chatLink || (isVisible('chat_link_check_result') && hasClass('chat_link_check_result', 'check_result_error'))) {
      return notaBene('chat_link');
    }

    ajax.post('/tools/chat_rights_transfer', { act: 'a_change_chat_owner', hash: cur.changeChatOwnerHash, user_link: userLink, chat_link: chatLink, comment: comment }, {
      onDone: function(response) {
        if (response) {
          showDoneBox(response);
          ChatRightsTransferPage.clearInputs();
        } else {
          showDoneBox(getLang('global_error'));
        }
      },
      onFail: function(response) {
        showDoneBox(response);
      },
      showProgress: lockButton.pbind('change_creator_button'),
      hideProgress: unlockButton.pbind('change_creator_button'),
    });
  },

  clearUserLinkInput() {
    val('user_link', '');
    hide('user_link_check_result');
    hide('user_link_progress_bar');
  },
  clearChatLinkInput() {
    val('chat_link', '');
    hide('chat_link_check_result');
    hide('chat_link_progress_bar');
  },
  clearInputs: function() {
    ChatRightsTransferPage.clearUserLinkInput();
    ChatRightsTransferPage.clearChatLinkInput();
    val('comment', '');
  }
};

try{stManager.done('admin/tools/chat_rights_transfer.js');}catch(e){}
