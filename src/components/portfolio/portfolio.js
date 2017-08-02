let Portfolio = {
    templateUrl: '/components/portfolio/portfolio.tpl',
    controller: ['$scope', 'WordpressData', '$routeParams', '$sce', '$location', '$timeout', ($scope, WordpressData, $routeParams, $sce, $location, $timeout) => {

        $scope.transitioning = true;

        $scope.trustBlob = (blob) => {
            blob = blob.replace(/<script>.*(<\/?script>?)?/, '')
            return $sce.trustAsHtml(blob)
        }
        $scope.transition = (to) => {
            $scope.initTransition = true
            $timeout(() => {
                $scope.transitioning = true
                $scope.initTransition = false
                $location.path(to)
            }, 333)
        }

        const loadMarquee = (url) => {
            return new Promise((resolve, reject) => {
                let img = document.createElement('img')
                img.addEventListener('load', () => {
                    resolve(url)
                })
                img.addEventListener('error', (e) => {
                    reject(e)
                })
                img.src = url
            })
        }

        const renderCurrent = () => {
            return loadMarquee($scope.current.acf.bg_img).then((url) => {
                $scope.transitioning = false
                $scope.$apply()
                return
            }).catch((err) => {
                return console.error('RENDERING ERROR:', err)
            })
        }

        const bindPortfolio = (data) => {
            let keys = Object.keys(data);
            $scope.portfolio = data;
            $scope.current = $scope.portfolio[$routeParams.slug];
            $scope.first = keys[0];
            $scope.last = keys[keys.length - 1];
            $scope.marqueeStyle = {
                backgroundImage: `url(${$scope.current.acf.bg_img})`
            }
            $scope.contentStyle = {
                backgroundColor: $scope.current.acf.background,
                color: $scope.current.acf.text_color
            }

            let titleLen = $scope.current.title.rendered.length
            $scope.titleStyle = {
                left: titleLen * 27,
                fontSize: `${Math.min(titleLen * 3.75, 15)}vw`,
            }

            $scope.content = $scope.current.acf.content;

            if (!$scope.current.cats) {
                $scope.current.cats = $scope.categories ?
                                      mapCatsFromIdx(
                                          $scope.current.categories,
                                          $scope.categories
                                      ) :
                                      []
            }

            return renderCurrent()
        }

        const bindCats = (data) => {
            $scope.categories = data
            return(
                $scope.current ?
                $scope.current.cats = mapCatsFromIdx(
                    $scope.current.categories,
                    $scope.categories
                ) :
                null
            )
        }

        const mapCatsFromIdx = (idxArr, categories) => {
            let cats = idxArr.map((i) => {
                return categories.find((cat) => {
                    return i === cat.id
                })
            })

            return cats
        }

        if (!WordpressData.categories) {
            WordpressData.fetchCats().then(() => {
                return bindCats(WordpressData.categories)
            })
        } else {
            bindCats(WordpressData.categories)
        }

        if (!WordpressData.portfolio) {
            WordpressData.fetchPortfolio().then(() => {
                return bindPortfolio(WordpressData.portfolio)
            })
        } else {
            bindPortfolio(WordpressData.portfolio)
        }

    }]
};

export default Portfolio;
