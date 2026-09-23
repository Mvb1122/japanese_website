import {
  AutoProcessor,
  AutoModelForImageTextToText,
  load_image,
  TextStreamer,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0";

// Load processor and model
const model_id = "onnx-community/LFM2.5-VL-450M-ONNX";
const processor = await AutoProcessor.from_pretrained(model_id);
const model = await AutoModelForImageTextToText.from_pretrained(model_id, {
  device: "webgpu",
  dtype: {
    embed_tokens: "fp16",
    decoder_model_merged: "q4f16",
    vision_encoder: "fp16",
  },
});

// processor.image_processor.do_image_splitting = false; // Disable image splitting for this demo (faster)

const messages = [
  {
    role: "user",
    content: [
      { type: "image" },
      { type: "text", text: "テキストを抽出しなさい。" },
    ],
  },
];
const prompt = processor.apply_chat_template(messages, {
  add_generation_prompt: true,
});

export async function OCR(url) {
    // Prepare inputs
    const image = await load_image(url);
    const inputs = await processor(image, prompt, { add_special_tokens: false });

    const outputs = await model.generate({
      ...inputs,
      max_new_tokens: 2048,
      streamer: new TextStreamer(processor.tokenizer, {
          skip_prompt: true,
          // callback_function: (text) => { /* Do something with the streamed output */ },
      }),
    });

    // Decode output
    const decoded = processor.batch_decode(
    outputs.slice(null, 
      [inputs.input_ids.dims.at(-1), null]),
      { skip_special_tokens: true },
    );
    console.log(decoded[0]);
    return decoded[0];
}