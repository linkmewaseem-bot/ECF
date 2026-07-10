export default class Resolver {

    resolve(binding, container) {
        return binding.factory(container);
    }

}