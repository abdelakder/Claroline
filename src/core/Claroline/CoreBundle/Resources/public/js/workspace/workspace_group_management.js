(function(){
    $('html, body').animate({
        scrollTop: 0
    }, 0);

    var twigWorkspaceId = document.getElementById('twig-attributes').getAttribute('data-workspaceId');
    var loading = false;
    var stop = false;
    var mode = 0; //0 = standard || 1 = search

    var standardRoute = function(){
        return Routing.generate('claro_workspace_registered_groups_paginated', {
                    'workspaceId':twigWorkspaceId,
                    'offset': $('.row-group').length
                });
    }

    var searchRoute = function(){
        return Routing.generate('claro_workspace_search_registered_groups', {
                    'workspaceId':twigWorkspaceId,
                    'offset': $('.row-group').length,
                    'search': document.getElementById('search-group-txt').value
                });
    }

    lazyloadGroups(standardRoute);

    $(window).scroll(function(){
        if  (($(window).scrollTop()+100 >= $(document).height() - $(window).height()) && loading === false && stop === false){
            if(mode == 0){
                lazyloadGroups(standardRoute);
            } else {
                lazyloadGroups(searchRoute);
            }
        }
    });

    $('#delete-group-button').click(function(){
        $('#validation-box').modal('show');
        $('#validation-box-body').html('removing '+ $('.chk-group:checked').length +' group(s)');
    });

   $('#modal-valid-button').click(function(){
        var parameters = {};
        var i = 0;
        $('.chk-group:checked').each(function(index, element){
            parameters[i] = element.value;
            i++;
        });

        parameters.workspaceId = twigWorkspaceId;
        var route = Routing.generate('claro_workspace_delete_groups', parameters);
        ClaroUtils.sendRequest(
            route,
            function(){
                $('.chk-group:checked').each(function(index, element){
                     $(element).parent().parent().remove();
                });
                $('#validation-box').modal('hide');
                $('#validation-box-body').empty();
            },
            undefined,
            'DELETE'
        );
    });

    $('#modal-cancel-button').click(function(){
        $('#validation-box').modal('hide');
        $('#validation-box-body').empty();
    });

    $('.search-group-button').click(function(){
        $('.checkbox-group-name').remove();
        $('#group-table-body').empty();
        stop = false;
        if (document.getElementById('search-group-txt').value != ''){
            mode = 1;
            lazyloadGroups(searchRoute);
        } else {
            mode = 0;
            lazyloadGroups(standardRoute);
        }
    });

    function lazyloadGroups(route){
        loading = true;
        $('#loading').show();
        ClaroUtils.sendRequest(
            route(),
            function(groups){
                $('#group-table-body').append(Twig.render(group_list, {
                    'groups': groups
                }));
                loading = false;
                $('#loading').hide();
                if(groups.lenght == 0){
                    stop = true;
                }
            },
            function(){
                if($(window).height() >= $(document).height() && stop == false){
                    lazyloadGroups(route)
                }
            }
        )
    }

    $('.button-parameters-group').live('click', function(e){
        var route = Routing.generate(
            'claro_workspace_tools_show_group_parameters',
            {'groupId': $(this).parent().parent().attr('data-group-id'), 'workspaceId': twigWorkspaceId}
        );

        window.location.href = route;
    })
})()