using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Media.Imaging;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Core;
using System.Runtime.InteropServices;
// To learn more about WinUI, the WinUI project structure,
// and more about our project templates, see: http://aka.ms/winui-project-info.

namespace real_esrgan_gui
{
    /// <summary>
    /// An empty window that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainWindow : Window
    {
        public string inputImagePath { get; set; }
        public string outputImagePath { get; set; }
        public BitmapImage inputBitmapImage { get; set; }
        public BitmapImage outputBitmapImage { get; set; } = new BitmapImage(new Uri("https://dummyimage.com/400x400/333333/fff.png&amp;text=This+is+output"));

        public MainWindow()
        {
            this.InitializeComponent();
            inputBitmapImage = new BitmapImage(new Uri("https://dummyimage.com/400x400/333333/fff.png&amp;text=This+is+input"));
            outputBitmapImage = new BitmapImage(new Uri("https://dummyimage.com/400x400/333333/fff.png&amp;text=This+is+output"));
        }

        public List<string> Models { get; } = new List<string>()
        {
            "realesrgan-x4plus",
            "realesrgan-x4plus-anime",
            "realesrnet-x4plus"
        };
        /*public Thickness tipsHeight = new Thickness(0, 0, 0, 100);

[DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll")]
[return: MarshalAs(UnmanagedType.Bool)]
static extern bool GetWindowRect(IntPtr hWnd, ref RECT lpRect);

[StructLayout(LayoutKind.Sequential)]
public struct RECT
{
    public int Left;                          //最左坐标
    public int Top;                           //最上坐标
    public int Right;                         //最右坐标
    public int Bottom;                        //最下坐标
}*/

        /*private int getWindowHeight()
        {
            IntPtr awin = GetForegroundWindow();
            RECT rect = new RECT();
            GetWindowRect(awin, ref rect);
            return rect.Bottom - rect.Top;
        }*/













        public String textBlockText { get; set; }
        public int progressValue { get; set; } = 0;
        public bool IsProgressIndermediate { get; set; } = false;
        public bool IsStartButtonEnabled { get; set; } = true;
        public bool progressBarShowError { get; set; } = false;

        private bool isImage(String file)
        {
            String[] imageSuffix = new string[] { ".jpg", ".png" };
            for (int i = 0; i < imageSuffix.Length; i++)
                if (file.EndsWith(imageSuffix[i]))
                    return true;
            return false;
        }

        private async void inputImageGrid_Drop(object sender, DragEventArgs e)
        {
            var inputs = await e.DataView.GetStorageItemsAsync();
            if (inputs.Count() == 1)
            {
                String imagePath = inputs[0].Path.ToString();
                if (isImage(imagePath))
                    inputImage.Source = new BitmapImage(new Uri(imagePath));
                else
                {

                    // tipsHeight.Bottom = getWindowHeight() / 2;
                    fileTypeErrorTip.IsOpen = true;
                }
              
            }
        }

        private void inputImageGrid_DragOver(object sender, DragEventArgs e)
        {
            e.AcceptedOperation = Windows.ApplicationModel.DataTransfer.DataPackageOperation.Copy;

            if (e.DragUIOverride != null)
            {
                e.DragUIOverride.Caption = "选择输入文件";
                e.DragUIOverride.IsContentVisible = true;
            }
        }

        private void inputImageGrid_DragLeave(object sender, DragEventArgs e)
        {

        }

        private void startConvertButton_Click(object sender, RoutedEventArgs e)
        {
            this.StratConverting();
            //outputImage.Source = new BitmapImage(new Uri(this.outputImagePath));
        }

        private async void StratConverting()
        {
            IsStartButtonEnabled = false;
            //startConvertButton.IsEnabled = false;
            IsProgressIndermediate = true;
            //progressBar.IsIndeterminate = true;
            progressValue = 0;
            //progressBar.Value = 0;
            progressBarShowError = false;
            //progressBar.ShowError = false;

            //* Create your Process
            Process process = new Process();
            process.StartInfo.WorkingDirectory = "C:\\Users\\Charlie\\Downloads\\realesrgan-ncnn-vulkan-20210901-windows";
            process.StartInfo.FileName = "C:\\Users\\Charlie\\Downloads\\realesrgan-ncnn-vulkan-20210901-windows\\realesrgan-ncnn-vulkan";

            this.outputImagePath = Path.GetTempPath() + Path.GetFileName(this.inputImagePath);

            process.StartInfo.Arguments = String.Format(
                "-i {0} -o {1} -n {2}",
                this.inputImagePath,
                this.outputImagePath,
                "realesrgan-x4plus-anime"
            );


            process.StartInfo.UseShellExecute = false;
            process.StartInfo.CreateNoWindow = true;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardError = true;
            //* Set your output and error (asynchronous) handlers
            process.OutputDataReceived += new DataReceivedEventHandler(OutputHandler);
            process.ErrorDataReceived += new DataReceivedEventHandler(OutputHandler);

            process.Exited += (sender, args) =>
            {
                IsStartButtonEnabled = true;
                //startConvertButton.IsEnabled = true;
                IsProgressIndermediate = false;
                //progressBar.IsIndeterminate = false;
                if (process.ExitCode != 0)
                {
                    progressBarShowError = true;
                }
                else
                {
                    progressValue = 0;
                    //this.outputImagePath = tempOutputImagePath;
                    outputBitmapImage = new BitmapImage(new Uri(this.outputImagePath));
                }
                process.Dispose();
            };

            try
            {
                process.EnableRaisingEvents = true;
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
                await process.WaitForExitAsync();
            }
            catch (Exception ex)
            {
                IsStartButtonEnabled = true;
                IsProgressIndermediate = false;
                progressBarShowError = true;
                return;
            }
            //* Start process and handlers
        }

        private void OutputHandler(object sendingProcess, DataReceivedEventArgs outLine)
        {
            //* Do your stuff with the output (write to console/log/StringBuilder)
            //textBlock.Dispatcher.Invoke(new Action(() =>
            //{

            //}));

            //myControl.Invoke((Action)delegate
            //{
            //    //You can put your UI update logic here
            //    myControl.Text = "Hello World from a different thread";
            //});

            this.textBlockText = outLine.Data;

            //await Windows.ApplicationModel.Core.CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            //{
            //    textBlock.Text = outLine.Data;
            //    // Do something on the dispatcher thread
            //});
            Console.WriteLine(outLine.Data);
        }
    }
}
