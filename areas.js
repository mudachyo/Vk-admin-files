// nsh: This js may be obsolete
AreasFunctions = {
  showRenameAreasBox: function(areaRows) {
    GeodbPage.showRenameActionBox(areaRows, getLang('edit_rename_areas'), getLang('edit_areas'), function(objectIds, translations, callback) {
      ajax.post('geodb', {
        act: 'a_rename_areas',
        object_ids: objectIds,
        ru_names: translations[cur.LANG_RUS],
        en_names: translations[cur.LANG_ENG],
        ua_names: translations[cur.LANG_UKR],
        kz_names: translations[cur.LANG_KAZ],
      }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  showMergeAreasBox: function(mainObjectId) {
    GeodbPage.showMergeActionBox(mainObjectId, getLang('edit_merge_areas'), function(mainId, cloneIds, callback) {
      ajax.post('geodb', { act: 'a_merge_areas', main_area_id: mainId, clone_area_ids: cloneIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  deleteAreas: function(cityRows) {
    GeodbPage.deleteAction(cityRows, function(objectIds, callback) {
      ajax.post('geodb', { act: 'a_delete_areas', area_ids: objectIds }, GeodbPage.defaultAjaxResponseHandler(callback));
    });
  },

  getAreaInfo: function(areaId) {
    var areaRow = GeodbPage.getObjectRow(areaId),
      areaInfoId = 'area_info' + areaId,
      areaInfo = ge(areaInfoId);

    if (!areaInfo) {
      areaInfo = ce('div', {id: areaInfoId, innerHTML: '1 sec!'});
      areaRow.appendChild(areaInfo);
      ajax.post('geodb', {
        act: 'a_get_area_info',
        c_id: areaId
      }, GeodbPage.defaultAjaxResponseHandler(function(response) {
        areaInfo.innerHTML = response;
      }));
    }
  },

  showMoveAreasBox: function(areaRows) {
    var countryId = cur.countryId,
      options = {title: getLang('edit_move_area'), width: 350},
      content = cur.moveAreasBoxContent;

    GeodbPage.showMessageBox(content, options, function() {
      var areaIds = val('areas_select').split(','),
        regionId = val('region_select');

      ajax.post('geodb', {
        act: 'a_move_areas',
        area_ids: areaIds,
        region_id: regionId
      }, GeodbPage.defaultAjaxResponseHandler(GeodbPage.afterMoveCityCallback.pbind(areaRows)));
    });

    GeodbPage.addObjectsMultiSelect('areas_select', areaRows);

    new RegionSelect(ge('region_select_input'), ge('region_select_row'), {
      country_id: countryId,
      autocomplete: true,
    });
  },
};

try {
  stManager.done('admin/geodb/areas.js');
} catch (e) {
}
