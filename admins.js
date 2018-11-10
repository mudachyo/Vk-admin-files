AdminsFunctions = {
  getCountryRow: function(userId, countryId) {
    return ge('row' + userId + '_' + countryId);
  },

  getCountryDeleteButton: function(userId, countryId) {
    return ge('row' + userId + '_' + countryId + '_delete');
  },

  deleteCountryRow: function(userId, countryId) {
    var countryRow = this.getCountryRow(userId, countryId),
      countryDB = this.getCountryDeleteButton(userId, countryId);

    setStyle(countryRow, {opacity: 0.4});
    val(countryDB, getLang('global_cancel'));
    countryDB.onclick = AdminsFunctions.restoreCountryRow.pbind(userId, countryId);

    ajax.post('geodb', {
      act: 'a_delete_admin_country',
      user_id: userId,
      country_id: countryId,
      hash: val('hash' + userId)
    });
  },

  restoreCountryRow: function(userId, countryId) {
    var countryRow = this.getCountryRow(userId, countryId),
      countryDB = this.getCountryDeleteButton(userId, countryId);

    setStyle(countryRow, {opacity: 1});
    val(countryDB, getLang('global_delete'));
    countryDB.onclick = AdminsFunctions.deleteCountryRow.pbind(userId, countryId);

    ajax.post('geodb', {
      act: 'a_restore_admin_country',
      user_id: userId,
      country_id: countryId,
      hash: val('hash' + userId)
    });
  },

  tryToAddEditor: function() {
    var admin_url = val('new_admin_url');
    var admin_country_ids = Array.from(ge('new_admin_country_ids').selectedOptions).map(function(e) {
      return e.value;
    });

    if (!admin_url || !admin_country_ids) {
      topMsg('<b>Warning:</b> Пожалуйста, введите ссылку на пользователя и его страну', 10);
    } else {
      AdminsFunctions.doAddEditor(admin_url, admin_country_ids, 'adding_progress');
    }
  },

  doAddEditor: function(profile_url, country_ids) {
    ajax.post('geodb', {
      act: 'a_add_rights_to_user',
      profile_url: profile_url,
      country_ids: country_ids,
      hash: ge('add_hash').value
    }, {
      onDone: function() {
        location.reload();
      }
    });
  },

  /**
   * NSHKARUBA: It's legacy code and it just works, i promise! :D
   * Todo: Simplify this logic
   */
  updateQuickfind: function() {
    var value = val('quick_find').toLowerCase(),
      user;

    if (!value) {
      for (var i = 0; i < cur.admins.length; i++) {
        user = cur.admins[i];
        show('row' + user.id);
        ge('link' + user.id).innerHTML = user.name;
      }
    } else {
      for (var i = 0; i < cur.admins.length; i++) {
        user = cur.admins[i];
        var name = user.name,
          ind = -1,
          new_name = '',
          last_found = -1,
          found = false,
          name_lower = name.toLowerCase();

        while ((ind = name_lower.indexOf(value)) != -1) {
          new_name += name.substr(0, ind);
          new_name += '<em>' + name.substr(ind, value.length) + '</em>';
          name = name.substr(ind + value.length);
          name_lower = name_lower.substr(ind + value.length);
          last_found = ind;
          found = true;
        }

        if (found) {
          show('row' + user.id);
        } else {
          hide('row' + user.id);
        }
      }
    }
  },

  highlightElement: function(e) {
    return function() {
      addClass(e, 'highlighted');
    };
  },

  unhighlightElement: function(e) {
    return function() {
      removeClass(e, 'highlighted');
    }
  },
};

try {
  stManager.done('admin/geodb/admins.js');
} catch (e) {
}
