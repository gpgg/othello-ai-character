# coding=utf-8
import argparse
import json
import logging
import os
import re
import time

import commons
#import gradio as gr
#import gradio.processing_utils as gr_processing_utils
import torch
import utils
from models import SynthesizerTrn
from scipy.io.wavfile import write
from text import _clean_text, text_to_sequence
from torch import LongTensor, no_grad

logging.getLogger('numba').setLevel(logging.WARNING)
limitation = os.getenv("SYSTEM") == "spaces"  # limit text and audio length in huggingface spaces

hps_ms = utils.get_hparams_from_file(r'config/config.json')
device = torch.device('cuda')
#audio_postprocess_ori = gr.Audio.postprocess

# def audio_postprocess(self, y):
#     data = audio_postprocess_ori(self, y)
#     if data is None:
#         return None
#     return gr_processing_utils.encode_url_or_file_to_base64(data["name"])


#gr.Audio.postprocess = audio_postprocess

def get_text(text, hps, is_symbol):
    text_norm, clean_text = text_to_sequence(text, hps.symbols, [] if is_symbol else hps.data.text_cleaners)
    if hps.data.add_blank:
        text_norm = commons.intersperse(text_norm, 0)
    text_norm = LongTensor(text_norm)
    return text_norm, clean_text

def create_tts_fn(net_g_ms, speaker_id):
    def tts_fn(text, language, noise_scale, noise_scale_w, length_scale, is_symbol):
        text = text.replace('\n', ' ').replace('\r', '').replace(" ", "")
        if limitation:
            text_len = len(re.sub("\[([A-Z]{2})\]", "", text))
            max_len = 100
            if is_symbol:
                max_len *= 3
            if text_len > max_len:
                return "Error: Text is too long", None
        if not is_symbol:
            if language == 0:
                text = f"[ZH]{text}[ZH]"
            elif language == 1:
                text = f"[JA]{text}[JA]"
            else:
                text = f"{text}"
        stn_tst, clean_text = get_text(text, hps_ms, is_symbol)
        with no_grad():
            x_tst = stn_tst.unsqueeze(0).to(device)
            x_tst_lengths = LongTensor([stn_tst.size(0)]).to(device)
            sid = LongTensor([speaker_id]).to(device)
            audio = net_g_ms.infer(x_tst, x_tst_lengths, sid=sid, noise_scale=noise_scale, noise_scale_w=noise_scale_w,
                                   length_scale=length_scale)[0][0, 0].data.cpu().float().numpy()

        return "Success", (22050, audio)
    return tts_fn

def create_to_symbol_fn(hps):
    def to_symbol_fn(is_symbol_input, input_text, temp_lang):
        if temp_lang == 0:
            clean_text = f'[ZH]{input_text}[ZH]'
        elif temp_lang == 1:
            clean_text = f'[JA]{input_text}[JA]'
        else:
            clean_text = input_text
        return _clean_text(clean_text, hps.data.text_cleaners) if is_symbol_input else ''

    return to_symbol_fn
def change_lang(language):
    if language == 0:
        return 0.6, 0.668, 1.2
    elif language == 1:
        return 0.6, 0.668, 1
    else:
        return 0.6, 0.668, 1

def initialize():
    with open("pretrained_models/info.json", "r", encoding="utf-8") as f:
        models_info = json.load(f)
        print(models_info)
        sid = models_info['mika']['sid']
        name_en = models_info['mika']['name_en']
        name_zh = models_info['mika']['name_zh']
        title = models_info['mika']['title']
        cover = f"pretrained_models/mika/{models_info['mika']['cover']}"
        example = models_info['mika']['example']
        language = models_info['mika']['language']
        net_g_ms = SynthesizerTrn(
            len(hps_ms.symbols),
            hps_ms.data.filter_length // 2 + 1,
            hps_ms.train.segment_size // hps_ms.data.hop_length,
            n_speakers=hps_ms.data.n_speakers if models_info['mika']['type'] == "multi" else 0,
            **hps_ms.model)
        utils.load_checkpoint(f'pretrained_models/mika/mika.pth', net_g_ms, None)
        _ = net_g_ms.eval().to(device)
        tts_fn = create_tts_fn(net_g_ms, sid)
        to_symbol_fn = create_to_symbol_fn(hps_ms)
        return tts_fn

def save_audio_clip(text, tts_fn, save_path='./audio_clips/mika'):
    timestr = time.strftime("%Y%m%d-%H%M%S")
    save_path = f'{save_path}/{timestr}.wav'
    res_str, res = tts_fn(text, language=1, noise_scale=0.6, noise_scale_w=0.668, length_scale=1, is_symbol=False)
    print(res_str)
    print(res)
    write(save_path, res[0], res[1])
    return timestr
    
if __name__ == '__main__':
    # with open("pretrained_models/info.json", "r", encoding="utf-8") as f:
    #     models_info = json.load(f)
    #     print(models_info)
    #     sid = models_info['mika']['sid']
    #     name_en = models_info['mika']['name_en']
    #     name_zh = models_info['mika']['name_zh']
    #     title = models_info['mika']['title']
    #     cover = f"pretrained_models/mika/{models_info['mika']['cover']}"
    #     example = models_info['mika']['example']
    #     language = models_info['mika']['language']
    #     net_g_ms = SynthesizerTrn(
    #         len(hps_ms.symbols),
    #         hps_ms.data.filter_length // 2 + 1,
    #         hps_ms.train.segment_size // hps_ms.data.hop_length,
    #         n_speakers=hps_ms.data.n_speakers if models_info['mika']['type'] == "multi" else 0,
    #         **hps_ms.model)
    #     utils.load_checkpoint(f'pretrained_models/mika/mika.pth', net_g_ms, None)
    #     _ = net_g_ms.eval().to(device)
    #     tts_fn = create_tts_fn(net_g_ms, sid)
    #     to_symbol_fn = create_to_symbol_fn(hps_ms)
    #     res_str, res = tts_fn(text='こんにちは', language=1, noise_scale=0.6, noise_scale_w=0.668, length_scale=1, is_symbol=False)
    #     print(res_str)
    #     print(res)
    #     write('./audio_clips/mika.wav', res[0], res[1])
    tts_fn = initialize()
    save_audio_clip(text='天気がいいですね', tts_fn=tts_fn)