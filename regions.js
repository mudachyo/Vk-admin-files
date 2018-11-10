RegionsFunctions = {
  showRenameRegionsBox: function(regionRows) {
    GeodbPage.showRenameActionBox(regionRows, getLang('edit_rename_regions'), getLang('edit_regions'), function(objectIds, translations, callback) {
      ajax.post('geodb', {
        act: 'a_rename_regions',
        object_ids: objectIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
      }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMergeRegionsBox: function(mainObjectId) {
    GeodbPage.showMergeActionBox(mainObjectId, getLang('edit_merge_regions'), function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_regions', main_region_id: mainId, clone_region_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showDeleteRegionsBox: function(cityRows) {
    GeodbPage.deleteAction(cityRows, function(objectIds, callback) {
      ajax.post('geodb', { act: 'a_delete_regions', region_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showCreateRegionsBox: function() {
    var options = {title: "Добавить регионы", width: 300},
      content = cur.createRegionsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var region_names = GeodbPage.getNamesFromTextArea('new_region_names'),
        country_id = getUrlParam('cn_id');

      ajax.post('geodb.php', {
        act: 'a_create_regions',
        region_names: region_names,
        country_id: country_id
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.defaultCreateObjectsCallback()));
    });
  },

  getRegionInfo: function(regionId) {
    GeodbPage.addObjectInfo(regionId, function(callback) {
      ajax.post('geodb', { act: 'a_get_region_info', c_id: regionId }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMoveRegionsBox: function(regionRows) {
    var options = {title: getLang('edit_move_regions'), width: 350},
      content = cur.moveRegionsBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var regionIds = val('regions_select').split(','),
        countryId = val('country_select');

      ajax.post('geodb', {
        act: 'a_move_regions',
        region_ids: regionIds,
        country_id: countryId
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback.pbind(regionRows)));
    });

    var countryId = cur.countryId;

    GeodbPage.addObjectsMultiSelect('regions_select', regionRows);
    new CountrySelect(ge('country_select_input'), ge('country_select_row'), {
      autocomplete: true,
      country_id: countryId,
    });
  },

  showApproveRegionsBox: function(regionRows) {
    var options = {title: getLang('edit_approve_regions'), width: 350},
      content = cur.approveBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var regionIds = val('objects_select').split(',');
      ajax.post('geodb.php', {
        act: 'a_approve_regions',
        region_ids: regionIds
      }, GeodbPage.defaultAjaxResponseHandler(function() {
        GeodbPage.boldRows(regionRows);
      }));
    });

    GeodbPage.addObjectsMultiSelect('objects_select', regionRows);
  },

  approveRegions: function(regionRows) {
    GeodbPage.approveRows(regionRows, function(regionIds, callback) {
      ajax.post('geodb.php', { act: 'a_approve_regions', region_ids: regionIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },
};

try {
  stManager.done('admin/geodb/regions.js');
} catch (e) {
}
