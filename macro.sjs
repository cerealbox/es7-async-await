macro async {
    // declares a new async function, wrapping the body into a then-block
    rule { function $fparams {
        $fbody ...
    } } => {
        function $fparams {
            return asyncf(function*() {
                async $fbody...
            })
        }
    }

    // declares a new name async function, wrapping the body into a then-block
    rule { function $name:ident $fparams {
        $fbody ...
    } } => {
        function $name $fparams {
            return asyncf(function*() {
                async $fbody...
            })
        }
    }

    // declares a variable with the initial value of the result of the promise
    // and inserts the things after the await expression into a then-block
    rule { var $x:ident = await $y:expr $rest... } => {
        var $x = yield $y
        async $rest...
    }

    // inserts things after the await expression into a then-block
    rule { await $y:expr $rest... } => {
        yield $y
        async $rest...
    }

    // cleans up the unnecessary semicolons created by the above rules
    rule { ; $rest } => {
        async $rest
    }

    // ignores unmatched tokens while processing the tokens after them
    rule { $y $rest } => {
        $y
        async $rest
    }

    rule { await $y } => { yield $y }

    // ignores the last token to be processed if it's unmatched
    rule { $rest } => { $rest }
}

//for (x on xs) { console.log(x) }

function asyncf(f) {
    return new Promise(function(fulfill, reject) {
        var generator = f()
        var pair
        var exec = function(value) {
            try {
                pair = generator.next(value)
                if (!pair.done) {
                    pair.value.then(
                        exec, 
                        function(error) {
                            generator.throw(error)
                        })
                } else {
                    fulfill(pair.value)
                }
            } catch (e) {
                reject(e)
            }
        }
        
        exec()
    })
}


/*
//example:
async function jim() {
	return await somepromise();
}

function somepromise() {
  return new Promise(function(fulfill, rejest) {
    setTimeout(fulfill, 1000)
  })
}

jim().then(alert.bind(window))
*/

