export default class Resolver {

    resolve(binding) {
        return binding.factory();
    }

}