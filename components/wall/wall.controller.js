
WallController.$inject = ['$scope', 'WSFactory', '$timeout'];
function WallController($scope, WSFactory, $timeout) {
    var vm = this;

    vm.wall = {
        images: []
    };
    vm.walls = [];
    vm.comment = {
        parent_id: 0
    };
    vm.server = SERVER_URL;
    vm.flowObject = {
        files: []
    };

    vm.init = init;
    vm.filesAdded = filesAdded;
    vm.add = add;
    vm.addComment = addComment;
    vm.reply = reply;
    vm.remove = remove;
    vm.edit = edit;
    vm.like = like;
    vm.noInteresting = noInteresting;
    
    function noInteresting(index) {
        
    }

    function like(typeId, type, wallId) {
        WSFactory.send({
            action: 'user_wall_like',
            type_id: typeId,
            type: type,
            user_id: 1,
            wall_id: wallId
        });
    }

    function init() {
        WSFactory.init(function () {
            WSFactory.send({
                action: 'get_walls'
            });
        }, function (event) {

            var routes = {
                'client_walls': function (response) {
                    vm.walls = response;
                },
                'client_remove_wall': function (response) {
                    vm.walls.splice(response, 1);
                },
                'client_like_wall': function (response) {
                    angular.forEach(vm.walls, function (wall) {
                        if (response.type == 'wall' && response.type_id == wall.id) {
                            wall.is_liked = response.action;
                            wall.likes = response.count;
                        } else if (response.type == 'comment' && response.wall_id == wall.id) {
                            angular.forEach(wall.comments, function (comment) {
                                if (comment.id == response.type_id) {
                                    comment.is_liked = response.action;
                                    comment.likes = response.count;
                                }
                            });
                        }
                    });
                },
                'client_add_wall': function (response) {
                    vm.walls.push(response);
                },
                'client_add_comment': function (response) {
                    angular.forEach(vm.walls, function (wall) {
                        if (response.wall_id == wall.id) {
                            wall.comments.push(response);
                        }
                    })
                }
            };

            var data = JSON.parse(event.data);

            if (routes.hasOwnProperty(data.action)) {
                $timeout(function () {
                    routes[data.action](data.response);
                }, 0);
            }
        });
    }

    function edit(index) {
        vm.wall = vm.walls[index];
    }
    
    function remove(index) {
        WSFactory.send({
            action: 'user_remove_wall',
            index: index,
            id: vm.walls[index].id
        });
    }

    function reply(commentId) {
        vm.comment.parent_id = commentId;
    }
    
    function addComment(id) {
        WSFactory.send({
            action: 'user_add_comment',
            comment: vm.comment,
            wall_id: id
        });
        vm.comment = {parent_id: 0};
    }

    function add() {
        WSFactory.send({
            action: 'user_add_wall',
            wall: vm.wall
        });
        vm.wall = {images: []};
    }

    function filesAdded($file, $flow) {
        console.log($flow);
        if (vm.wall.images.length > 5) {
            alert('No more 5 files');
            $file.cancel();
        } else {
            var fileReader = new FileReader();
            fileReader.readAsDataURL($file.file);
            fileReader.onload = function (event) {
                $scope.$apply(function () {
                    vm.wall.images.push({
                        type: $file.file.type.split('/')[1],
                        image: event.target.result
                    });
                });
            };
        }
    }
}