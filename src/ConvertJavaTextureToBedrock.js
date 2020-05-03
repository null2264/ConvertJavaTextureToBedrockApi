import {AbstractInput} from "./input/AbstractInput";
import {AbstractLog} from "./log/AbstractLog";
import {AbstractOutput} from "./output/AbstractOutput";
import {addAdditionalConverters, getConverters} from "./converter/converters";
import {Options} from "./Options";

/**
 * Class ConvertJavaTextureToBedrock
 */
class ConvertJavaTextureToBedrock {
    /**
     * ConvertJavaTextureToBedrock constructor
     *
     * @param {AbstractInput} input
     * @param {AbstractOutput} output
     * @param {AbstractLog} log
     * @param {Options} options
     */
    constructor(input, output, log, options = {}) {
        /**
         * @type {AbstractInput}
         *
         * @protected
         */
        this.input = input;
        /**
         * @type {AbstractOutput}
         *
         * @protected
         */
        this.output = output;
        /**
         * @type {AbstractLog}
         *
         * @protected
         */
        this.log = log;
        /**
         * @type {Options}
         *
         * @protected
         */
        this.options = {
            ...new Options(),
            ...options
        };
    }

    /**
     * @returns {Promise<*>}
     */
    async convert() {
        this.log.log("Start conversion");

        if (this.options.experimental) {
            this.log.warn(`EXPERIMENTAL CONVERSIONS ENABLED!`)
        }

        await this.output._init(this.input, this.log, this.options);

        for await (const entry of this.input.getEntries()) {
            await entry._init(this.log, this.options);

            await this.output.applyInputEntry(entry);
        }

        for await (const converter of getConverters()) {
            await converter._init(this.input, this.output, this.log, this.options);

            await addAdditionalConverters(...await converter.convert());
        }

        const output = await this.output.generate();

        this.log.log("Conversion finished");

        this.log.log("Please reopen Minecraft after selecting the converted texture pack, because in the current version it seems to be a bug to reload the texture cache (Otherwise it's possible that you will have a mix between your previous and new texture pack, which can lead to appearance bugs that would not occur)");

        return output;
    }
}

export {ConvertJavaTextureToBedrock};