import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface StudentResultProps {
  result: any;
  onHome: () => void;
}

export default function StudentResult({ result, onHome }: StudentResultProps) {
  return (
    <div className="max-w-md mx-auto p-4 mt-10 text-center space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Kết Quả Thi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Tổng Điểm</p>
            <p className="text-6xl font-bold text-green-600">{result.score}</p>
            <p className="text-sm text-gray-500 mt-2">Thang điểm 10</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-green-200">
            <div>
              <p className="text-xs text-gray-500">Phần I</p>
              <p className="font-bold">{result.details.part1.score} / 4.5</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phần II</p>
              <p className="font-bold">{result.details.part2.score} / 4.0</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phần III</p>
              <p className="font-bold">{result.details.part3.score} / 1.5</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={onHome} variant="outline" className="w-full">
        Về Trang Chủ
      </Button>
    </div>
  );
}
