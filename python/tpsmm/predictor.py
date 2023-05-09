from moviepy.editor import *
from predict import Predictor


# 定义一个函数，用于将音频与视频合成
def merge_audio_and_video(video_path, audio_path, output_path):
    video = VideoFileClip(video_path)
    audio = AudioFileClip(audio_path)
    video_with_audio = video.set_audio(audio)
    video_with_audio.write_videofile(output_path, codec="libx264", audio_codec="aac")


predictor = Predictor()
predictor.setup()  # 调用 setup 方法
result_path = predictor.predict(
    source_image="./input/tps_avatar.png",
    driving_video="./input/tps_driver_video_512.mp4",
    dataset_name="vox",
)

# 提取音频轨道并与生成的视频合成
driving_video = "./input/tps_driver_video_512.mp4"
output_video_path = str(result_path).replace(".mp4", "_with_audio.mp4")
merge_audio_and_video(str(result_path), driving_video, output_video_path)

print(output_video_path)
